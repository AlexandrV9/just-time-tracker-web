import type { VerificationEmailLang } from "./IVerificationEmailSender.js";

/**
 * Порт транспорта отправки verification/reset кода (SMTP / console / …).
 */
export interface IVerificationCodeMailer {
  sendVerificationCode(params: {
    to: string;
    code: string;
    lang?: VerificationEmailLang;
  }): Promise<void>;
}
