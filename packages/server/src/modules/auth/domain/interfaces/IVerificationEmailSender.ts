export type VerificationEmailLang = "en" | "ru" | "zh";

/**
 * Порт отправки verification/reset кода на email.
 */
export interface IVerificationEmailSender {
  /**
   * @throws EmailDeliveryException при ошибке доставки / дневном лимите
   */
  send(input: {
    userId: string;
    to: string;
    code: string;
    lang?: VerificationEmailLang;
  }): Promise<void>;
}
