import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
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
import { authRepository } from "./auth.repository.js";
import {
  passwordResetQueries,
  type PasswordResetRow,
} from "./passwordReset.queries.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const generateCode = () => randomInt(100_000, 1_000_000).toString();

const isExpired = (row: PasswordResetRow) =>
  Date.parse(row.expiresAt) <= Date.now();

// ── Reset token (HMAC-signed proof that the code was verified) ───────────────

const signResetToken = (data: string) =>
  createHmac("sha256", config.auth.accessToken.secret)
    .update(data)
    .digest("hex");

const encodeResetToken = (userId: string): string => {
  const exp = Date.now() + config.email.verification.codeTtlSec * 1000;
  const payload = Buffer.from(JSON.stringify({ userId, exp })).toString(
    "base64url",
  );
  return `${payload}.${signResetToken(payload)}`;
};

const decodeResetToken = (token: string): { userId: string } | null => {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;

    const payload = token.slice(0, dot);
    const signature = token.slice(dot + 1);
    const expected = signResetToken(payload);

    if (
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      return null;
    }

    const { userId, exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as { userId: string; exp: number };

    if (
      typeof userId !== "string" ||
      typeof exp !== "number" ||
      exp <= Date.now()
    ) {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

type PendingState = {
  status: "pending";
  email: string;
  expiresAt: string;
  resendAvailableAt: string;
  devCode?: string;
};

const buildPendingState = (
  email: string,
  expiresAt: Date,
  resendAvailableAt: Date,
  code?: string,
): PendingState => {
  const state: PendingState = {
    status: "pending",
    email,
    expiresAt: expiresAt.toISOString(),
    resendAvailableAt: resendAvailableAt.toISOString(),
  };

  if (code && shouldExposeDevCode()) {
    state.devCode = code;
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
  const code = generateCode();
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

const getActiveUserByEmail = async (email: string) => {
  const user = await authRepository.getUserByEmail(email);
  if (!user || user.is_active === false) return null;
  return user as { id: string; password_hash: string | null };
};

type StatusState =
  | { status: "none" }
  | { status: "expired"; email: string }
  | PendingState;

const getStatus = async (input: {
  email: string;
}): Promise<SuccessResponse<StatusState>> => {
  const email = normalizeEmail(input.email);
  const user = await getActiveUserByEmail(email);

  if (!user) {
    return { success: true, data: { status: "none" } };
  }

  const row = await passwordResetQueries.findByUserId(user.id);
  if (!row) {
    return { success: true, data: { status: "none" } };
  }

  if (isExpired(row)) {
    return { success: true, data: { status: "expired", email } };
  }

  return {
    success: true,
    data: buildPendingState(
      email,
      new Date(row.expiresAt),
      new Date(row.resendAvailableAt),
    ),
  };
};

// ── start ──────────────────────────────────────────────────────────────────

const start = async (input: {
  email: string;
  lang?: EmailLang;
}): Promise<
  SuccessResponse<PendingState> | ErrorResponse<{ retryAfter: string } | null>
> => {
  const email = normalizeEmail(input.email);
  const user = await getActiveUserByEmail(email);

  if (!user) {
    return { success: false, message: "USER_NOT_FOUND" };
  }

  const existing = await passwordResetQueries.findByUserId(user.id);
  if (existing && !isExpired(existing)) {
    return {
      success: true,
      data: buildPendingState(
        email,
        new Date(existing.expiresAt),
        new Date(existing.resendAvailableAt),
      ),
    };
  }

  const rateLimitKey = rateLimitKeys.resetEmail(email);
  const rateLimitCheck = await rateLimitService.checkRequestLimit(
    rateLimitKey,
    config.rateLimit.passwordResetStart.maxPerHourPerEmail,
    3600,
  );
  if (rateLimitCheck.blocked) {
    return {
      success: false,
      message: "RATE_LIMITED",
      data: { retryAfter: rateLimitCheck.retryAfter },
    };
  }

  const sent = await sendCode(user.id, email, input.lang);
  if (!("code" in sent)) return sent;

  await rateLimitService.consumeRequest(rateLimitKey, 3600);

  const { code, codeHash, expiresAt, resendAvailableAt } = sent;

  const row = await passwordResetQueries.upsert({
    userId: user.id,
    codeHash,
    expiresAt,
    resendAvailableAt,
  });

  return {
    success: true,
    data: buildPendingState(
      email,
      new Date(row.expiresAt),
      new Date(row.resendAvailableAt),
      code,
    ),
  };
};

// ── verify ───────────────────────────────────────────────────────────────────

type VerifyResult =
  | { status: "verified"; resetToken: string }
  | { status: "expired" };

const verify = async (input: {
  email: string;
  code: string;
}): Promise<
  SuccessResponse<VerifyResult> | ErrorResponse<{ retryAfter: string } | null>
> => {
  const email = normalizeEmail(input.email);
  const { maxAttempts } = config.email.verification;

  const user = await getActiveUserByEmail(email);
  if (!user) {
    return { success: false, message: "INVALID_CODE" };
  }

  const verifyKey = rateLimitKeys.verifyReset(user.id);
  const lockCheck = await rateLimitService.checkLocked([verifyKey]);
  if (lockCheck.blocked) {
    return {
      success: false,
      message: "TOO_MANY_ATTEMPTS",
      data: { retryAfter: lockCheck.retryAfter },
    };
  }

  const row = await passwordResetQueries.findByUserId(user.id);
  if (!row) {
    return { success: false, message: "INVALID_CODE" };
  }

  if (isExpired(row)) {
    await passwordResetQueries.deleteByUserId(user.id);
    return { success: true, data: { status: "expired" } };
  }

  if (row.attemptsCount >= maxAttempts) {
    await passwordResetQueries.resetAttempts(user.id);
  }

  const isValid = tokenService.comparePassword(input.code, row.codeHash);
  if (!isValid) {
    await passwordResetQueries.incrementAttempts(user.id);
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

  await rateLimitService.recordSuccess([verifyKey]);

  return {
    success: true,
    data: { status: "verified", resetToken: encodeResetToken(user.id) },
  };
};

// ── resend ───────────────────────────────────────────────────────────────────

const resend = async (input: {
  email: string;
  lang?: EmailLang;
}): Promise<
  | SuccessResponse<PendingState>
  | ErrorResponse<{ resendAvailableAt: string; retryAfter?: string } | null>
> => {
  const email = normalizeEmail(input.email);
  const user = await getActiveUserByEmail(email);

  if (!user) {
    return { success: false, message: "USER_NOT_FOUND" };
  }

  const verifyKey = rateLimitKeys.verifyReset(user.id);
  const lockCheck = await rateLimitService.checkLocked([verifyKey]);
  if (lockCheck.blocked) {
    return {
      success: false,
      message: "TOO_MANY_ATTEMPTS",
      data: {
        resendAvailableAt: lockCheck.retryAfter,
        retryAfter: lockCheck.retryAfter,
      },
    };
  }

  const existing = await passwordResetQueries.findByUserId(user.id);
  if (existing && Date.parse(existing.resendAvailableAt) > Date.now()) {
    return {
      success: false,
      message: "RESEND_TOO_EARLY",
      data: { resendAvailableAt: existing.resendAvailableAt },
    };
  }

  const sent = await sendCode(user.id, email, input.lang);
  if (!("code" in sent)) return sent;
  const { code, codeHash, expiresAt, resendAvailableAt } = sent;

  const row = existing
    ? await passwordResetQueries.refreshForResend({
        userId: user.id,
        codeHash,
        expiresAt,
        resendAvailableAt,
      })
    : await passwordResetQueries.upsert({
        userId: user.id,
        codeHash,
        expiresAt,
        resendAvailableAt,
      });

  if (!row) {
    return { success: false, message: "CODE_NOT_FOUND" };
  }

  return {
    success: true,
    data: buildPendingState(
      email,
      new Date(row.expiresAt),
      new Date(row.resendAvailableAt),
      code,
    ),
  };
};

// ── confirm ──────────────────────────────────────────────────────────────────

type ConfirmResult = { status: "success" } | { status: "expired" };

const confirm = async (input: {
  resetToken: string;
  newPassword: string;
}): Promise<SuccessResponse<ConfirmResult> | ErrorResponse> => {
  const decoded = decodeResetToken(input.resetToken);
  if (!decoded) {
    return { success: false, message: "RESET_TOKEN_INVALID" };
  }

  const { userId } = decoded;

  const row = await passwordResetQueries.findByUserId(userId);
  if (!row) {
    return { success: false, message: "CODE_NOT_FOUND" };
  }

  if (isExpired(row)) {
    await passwordResetQueries.deleteByUserId(userId);
    return { success: true, data: { status: "expired" } };
  }

  const currentHash = await authRepository.getUserPasswordHash(userId);
  if (
    currentHash &&
    tokenService.comparePassword(input.newPassword, currentHash)
  ) {
    return { success: false, message: "SAME_PASSWORD" };
  }

  const newHash = await tokenService.generatePasswordHash(input.newPassword);
  const updated = await authRepository.setUserPassword(userId, newHash);
  if (!updated) {
    return { success: false, message: "User not found" };
  }

  await passwordResetQueries.deleteByUserId(userId);

  return { success: true, data: { status: "success" } };
};

export const passwordResetService = {
  getStatus,
  start,
  verify,
  resend,
  confirm,
};
