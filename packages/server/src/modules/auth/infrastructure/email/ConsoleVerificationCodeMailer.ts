import type {
  IVerificationCodeMailer,
  VerificationEmailLang,
} from "../../domain/index.js";

/**
 * Dev/console транспорт: пишет код в stdout.
 */
export class ConsoleVerificationCodeMailer implements IVerificationCodeMailer {
  async sendVerificationCode(params: {
    to: string;
    code: string;
    lang?: VerificationEmailLang;
  }): Promise<void> {
    console.log(
      `[ConsoleVerificationCodeMailer:console] Verification code for ${params.to}: ${params.code}`,
    );
  }
}
