import {
  EmailDeliveryException,
  type IEmailDailyLimitRepository,
  type IVerificationCodeMailer,
  type IVerificationEmailSender,
  type VerificationEmailLang,
} from "../../domain/index.js";

/**
 * Оркестрация: дневной лимит + отправка кода.
 * Замена legacy deliverVerificationEmail для auth-модуля.
 */
export class VerificationEmailSender implements IVerificationEmailSender {
  constructor(
    private readonly dailyLimits: IEmailDailyLimitRepository,
    private readonly mailer: IVerificationCodeMailer,
    /**
     * Это max число писем на одного пользователя за день
     */
    private readonly dailyLimitPerUser: number,
  ) {}

  async send(input: {
    userId: string;
    to: string;
    code: string;
    lang?: VerificationEmailLang;
  }): Promise<void> {
    let slotReserved = false;

    if (this.dailyLimitPerUser > 0) {
      slotReserved = await this.dailyLimits.tryConsumeSendSlot(
        input.userId,
        this.dailyLimitPerUser,
      );
      if (!slotReserved) {
        throw new EmailDeliveryException("EMAIL_DAILY_LIMIT");
      }
    }

    try {
      await this.mailer.sendVerificationCode({
        to: input.to,
        code: input.code,
        lang: input.lang,
      });
    } catch (error) {
      if (slotReserved) {
        await this.dailyLimits.releaseSendSlot(input.userId);
      }

      if (error instanceof EmailDeliveryException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "EMAIL_SEND_FAILED";

      throw new EmailDeliveryException(message);
    }
  }
}
