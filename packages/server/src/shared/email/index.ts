import { config } from "../config/index.js";
import { createConsoleEmailService } from "./console-email.service.js";
import { createSmtpEmailService } from "./smtp-email.service.js";
import type { EmailService } from "./email.types.js";

/** Console transport is dev-only; expose code in API + logs whenever it is active. */
export const shouldExposeDevCode = () =>
  config.email.transport === "console" && !config.app.isProduction;

let emailServiceInstance: EmailService | null = null;

const createEmailService = (): EmailService =>
  config.email.transport === "smtp"
    ? createSmtpEmailService()
    : createConsoleEmailService();

export const getEmailService = (): EmailService => {
  // Recreate in non-production so EMAIL_TRANSPORT changes apply without restart.
  if (!config.app.isProduction) {
    return createEmailService();
  }

  if (!emailServiceInstance) {
    emailServiceInstance = createEmailService();
  }

  return emailServiceInstance;
};

export type {
  EmailService,
  SendVerificationCodeParams,
} from "./email.types.js";

export {
  resolveEmailLang,
  type EmailLang,
} from "./verification-email.template.js";

export {
  assertDailyEmailLimit,
  deliverVerificationEmail,
} from "./email-daily-limit.service.js";
