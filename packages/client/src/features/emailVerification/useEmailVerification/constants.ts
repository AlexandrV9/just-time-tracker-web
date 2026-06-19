import { startEmailVerificationSchema } from "@time-tracker/shared";
import z from "zod";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const createEmailVerificationFormSchema = (currentEmail: string) =>
  startEmailVerificationSchema.superRefine((data, ctx) => {
    const normalizedCurrent = normalizeEmail(currentEmail);

    if (
      normalizedCurrent.length > 0 &&
      normalizeEmail(data.email) === normalizedCurrent
    ) {
      ctx.addIssue({
        code: "custom",
        message: "email.sameAsCurrent",
        path: ["email"],
      });
    }
  });

export type EmailVerificationFormValues = z.infer<
  ReturnType<typeof createEmailVerificationFormSchema>
>;

export const mapRequestErrorKey = (message?: string) => {
  switch (message) {
    case "EMAIL_ALREADY_EXISTS":
      return "errors.emailAlreadyExists";
    case "RESEND_TOO_EARLY":
      return "errors.resendTooEarly";
    case "CODE_NOT_FOUND":
      return "errors.codeNotFound";
    case "EMAIL_DAILY_LIMIT":
      return "errors.dailyLimit";
    default:
      return "errors.requestFailed";
  }
};

export const mapConfirmErrorKey = (message?: string) => {
  switch (message) {
    case "INVALID_CODE":
      return "errors.invalidCode";
    case "TOO_MANY_ATTEMPTS":
      return "errors.tooManyAttempts";
    case "CODE_NOT_FOUND":
      return "errors.codeNotFound";
    case "EMAIL_ALREADY_EXISTS":
      return "errors.emailAlreadyExists";
    default:
      return "errors.verifyFailed";
  }
};
