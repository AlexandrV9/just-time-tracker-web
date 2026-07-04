import { randomInt } from "node:crypto";
import {
  config,
  deliverVerificationEmail,
  rateLimitKeys,
  rateLimitService,
  shouldExposeDevCode,
  tokenService,
  type EmailLang,
} from "../shared/index.js";
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";
import {
  emailVerificationQueries,
  type EmailVerificationRow,
} from "./emailVerification.queries.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const generateVerificationCode = () => randomInt(100_000, 1_000_000).toString();

const isExpired = (row: EmailVerificationRow) =>
  Date.parse(row.expiresAt) <= Date.now();

type PendingState = {
  status: "pending";
  email: string;
  expiresAt: string;
  resendAvailableAt: string;
  devCode?: string;
};

const toPendingState = (row: EmailVerificationRow): PendingState => ({
  status: "pending",
  email: row.newEmail,
  expiresAt: row.expiresAt,
  resendAvailableAt: row.resendAvailableAt,
});

const withDevCode = (state: PendingState, code: string): PendingState => {
  if (shouldExposeDevCode()) {
    return { ...state, devCode: code };
  }
  return state;
};

const sendCode = async (
  userId: string,
  email: string,
  lang?: EmailLang,
): Promise<
  | {
      code: string;
      codeHash: string;
      expiresAt: Date;
      resendAvailableAt: Date;
    }
  | ErrorResponse
> => {
  const { codeTtlSec, resendCooldownSec } = config.email.verification;
  const code = generateVerificationCode();
  const codeHash = await tokenService.generatePasswordHash(code);
  const expiresAt = new Date(Date.now() + codeTtlSec * 1000);
  const resendAvailableAt = new Date(Date.now() + resendCooldownSec * 1000);

  const deliveryError = await deliverVerificationEmail(userId, {
    to: email,
    code,
    lang,
  });
  if (deliveryError) return deliveryError;

  return { code, codeHash, expiresAt, resendAvailableAt };
};

type StatusState =
  | { status: "none" }
  | { status: "expired"; email: string }
  | PendingState;

const getStatus = async (input: {
  userId: string;
}): Promise<SuccessResponse<StatusState>> => {
  const row = await emailVerificationQueries.findByUserId(input.userId);

  if (!row) {
    return { success: true, data: { status: "none" } };
  }

  if (isExpired(row)) {
    return { success: true, data: { status: "expired", email: row.newEmail } };
  }

  return { success: true, data: toPendingState(row) };
};

type StartInput = { userId: string; email: string; lang?: EmailLang };

const start = async (
  input: StartInput,
): Promise<SuccessResponse<PendingState> | ErrorResponse<{ retryAfter: string }>> => {
  const { userId, lang } = input;
  const email = normalizeEmail(input.email);

  if (await emailVerificationQueries.isEmailTakenByAnotherUser(email, userId)) {
    return { success: false, message: "EMAIL_ALREADY_EXISTS" };
  }

  const existing = await emailVerificationQueries.findByUserId(userId);
  if (
    existing &&
    !isExpired(existing) &&
    normalizeEmail(existing.newEmail) === email
  ) {
    return { success: true, data: toPendingState(existing) };
  }

  const rateLimitKey = rateLimitKeys.emailVerificationStart(email);
  const rateLimitCheck = await rateLimitService.checkRequestLimit(
    rateLimitKey,
    config.rateLimit.emailVerificationStart.maxPerHourPerEmail,
    3600,
  );
  if (rateLimitCheck.blocked) {
    return {
      success: false,
      message: "RATE_LIMITED",
      data: { retryAfter: rateLimitCheck.retryAfter },
    };
  }

  const sent = await sendCode(userId, email, lang);
  if (!("code" in sent)) return sent;

  await rateLimitService.consumeRequest(rateLimitKey, 3600);

  const { code, codeHash, expiresAt, resendAvailableAt } = sent;

  const row = await emailVerificationQueries.upsertVerification({
    userId,
    newEmail: email,
    codeHash,
    expiresAt,
    resendAvailableAt,
  });

  return { success: true, data: withDevCode(toPendingState(row), code) };
};

type ConfirmInput = { userId: string; code: string };

type ConfirmResult =
  | {
      status: "success";
      user: {
        id: string;
        name: string;
        login: string;
        email: string | null;
        avatar: string | null;
      };
    }
  | { status: "expired" };

const confirm = async (
  input: ConfirmInput,
): Promise<
  | SuccessResponse<ConfirmResult>
  | ErrorResponse<{ retryAfter: string } | null>
> => {
  const { userId, code } = input;
  const { maxAttempts } = config.email.verification;
  const verifyKey = rateLimitKeys.verifyEmail(userId);

  const lockCheck = await rateLimitService.checkLocked([verifyKey]);
  if (lockCheck.blocked) {
    return {
      success: false,
      message: "TOO_MANY_ATTEMPTS",
      data: { retryAfter: lockCheck.retryAfter },
    };
  }

  const row = await emailVerificationQueries.findByUserId(userId);

  if (!row) {
    return { success: false, message: "CODE_NOT_FOUND" };
  }

  if (isExpired(row)) {
    await emailVerificationQueries.deleteByUserId(userId);
    return { success: true, data: { status: "expired" } };
  }

  if (row.attemptsCount >= maxAttempts) {
    await emailVerificationQueries.resetAttempts(userId);
  }

  const isValid = tokenService.comparePassword(code, row.codeHash);

  if (!isValid) {
    await emailVerificationQueries.incrementAttempts(userId);
    const failureResult = await rateLimitService.recordFailure([verifyKey]);

    if (failureResult.blocked) {
      return {
        success: false,
        message: "TOO_MANY_ATTEMPTS",
        data: { retryAfter: failureResult.retryAfter },
      };
    }

    return { success: false, message: "INVALID_CODE" };
  }

  try {
    const updatedUser = await emailVerificationQueries.confirmUserEmail({
      userId,
      email: row.newEmail,
    });

    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }

    await emailVerificationQueries.deleteByUserId(userId);
    await rateLimitService.recordSuccess([verifyKey]);

    return { success: true, data: { status: "success", user: updatedUser } };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return { success: false, message: "EMAIL_ALREADY_EXISTS" };
    }

    console.error("Confirm email verification error:", error);
    return { success: false, message: "Internal server error" };
  }
};

const resend = async (input: {
  userId: string;
  lang?: EmailLang;
}): Promise<
  | SuccessResponse<PendingState>
  | ErrorResponse<{ resendAvailableAt: string; retryAfter?: string } | null>
> => {
  const { userId, lang } = input;
  const verifyKey = rateLimitKeys.verifyEmail(userId);
  const lockCheck = await rateLimitService.checkLocked([verifyKey]);
  if (lockCheck.blocked) {
    return {
      success: false,
      message: "TOO_MANY_ATTEMPTS",
      data: { resendAvailableAt: lockCheck.retryAfter, retryAfter: lockCheck.retryAfter },
    };
  }

  const row = await emailVerificationQueries.findByUserId(userId);

  if (!row) {
    return { success: false, message: "CODE_NOT_FOUND" };
  }

  if (Date.parse(row.resendAvailableAt) > Date.now()) {
    return {
      success: false,
      message: "RESEND_TOO_EARLY",
      data: { resendAvailableAt: row.resendAvailableAt },
    };
  }

  const sent = await sendCode(userId, row.newEmail, lang);
  if (!("code" in sent)) return sent;
  const { code, codeHash, expiresAt, resendAvailableAt } = sent;

  const updated = await emailVerificationQueries.refreshForResend({
    userId,
    codeHash,
    expiresAt,
    resendAvailableAt,
  });

  if (!updated) {
    return { success: false, message: "CODE_NOT_FOUND" };
  }

  return { success: true, data: withDevCode(toPendingState(updated), code) };
};

const cancel = async (input: {
  userId: string;
}): Promise<SuccessResponse<{ status: "none" }>> => {
  await emailVerificationQueries.deleteByUserId(input.userId);
  return { success: true, data: { status: "none" } };
};

export const emailVerificationService = {
  getStatus,
  start,
  confirm,
  resend,
  cancel,
};
