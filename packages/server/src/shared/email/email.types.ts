import type { EmailLang } from "./verification-email.template.js";

export type SendVerificationCodeParams = {
  to: string;
  code: string;
  lang?: EmailLang;
};

export type EmailService = {
  sendVerificationCode: (params: SendVerificationCodeParams) => Promise<void>;
};
