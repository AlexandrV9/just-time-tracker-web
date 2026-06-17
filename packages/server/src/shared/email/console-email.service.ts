import type { EmailService, SendVerificationCodeParams } from "./email.types.js";

export const createConsoleEmailService = (): EmailService => ({
  async sendVerificationCode({ to, code }: SendVerificationCodeParams) {
    console.log(
      `[EmailService:console] Verification code for ${to}: ${code}`,
    );
  },
});
