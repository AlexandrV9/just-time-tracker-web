import { config } from "../config/index.js";
import { createConsoleEmailService } from "./console-email.service.js";
import { createSmtpEmailService } from "./smtp-email.service.js";
import type { EmailService } from "./email.types.js";

let emailServiceInstance: EmailService | null = null;

export const getEmailService = (): EmailService => {
  if (!emailServiceInstance) {
    emailServiceInstance =
      config.email.transport === "smtp"
        ? createSmtpEmailService()
        : createConsoleEmailService();
  }

  return emailServiceInstance;
};

export type { EmailService, SendVerificationCodeParams } from "./email.types.js";
