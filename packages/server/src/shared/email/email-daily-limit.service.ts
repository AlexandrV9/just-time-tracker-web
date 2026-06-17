import { config } from "../config/index.js";
import type { ErrorResponse } from "../types.js";
import { emailDailyLimitQueries } from "./email-daily-limit.queries.js";
import type { SendVerificationCodeParams } from "./email.types.js";

export const assertDailyEmailLimit = async (
  userId: string,
): Promise<ErrorResponse | null> => {
  const limit = config.email.dailyLimitPerUser;
  if (limit <= 0) return null;

  const count = await emailDailyLimitQueries.getSendCount(userId);
  if (count >= limit) {
    return { success: false, message: "EMAIL_DAILY_LIMIT" };
  }

  return null;
};

export const deliverVerificationEmail = async (
  userId: string,
  params: SendVerificationCodeParams,
): Promise<ErrorResponse | null> => {
  const limit = config.email.dailyLimitPerUser;
  let slotReserved = false;

  if (limit > 0) {
    slotReserved = await emailDailyLimitQueries.tryConsumeSendSlot(
      userId,
      limit,
    );
    if (!slotReserved) {
      return { success: false, message: "EMAIL_DAILY_LIMIT" };
    }
  }

  try {
    const { getEmailService } = await import("./index.js");
    await getEmailService().sendVerificationCode(params);
  } catch (error) {
    if (slotReserved) {
      await emailDailyLimitQueries.releaseSendSlot(userId);
    }
    throw error;
  }

  return null;
};
