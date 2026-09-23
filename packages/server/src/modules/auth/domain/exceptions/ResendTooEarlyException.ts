/**
 * Доменное исключение: повторная отправка кода запрошена слишком рано (cooldown).
 * @param resendAvailableAt - ISO-дата, когда можно запросить resend снова
 */
export class ResendTooEarlyException extends Error {
  constructor(readonly resendAvailableAt: string) {
    super("RESEND_TOO_EARLY");
    this.name = "ResendTooEarlyException";
  }
}
