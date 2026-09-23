/**
 * Доменное исключение: превышено число попыток ввода reset-кода.
 * @param retryAfter - ISO-дата, до которой нельзя пробовать снова (или когда снять lock)
 */
export class TooManyAttemptsException extends Error {
  constructor(readonly retryAfter: string) {
    super("TOO_MANY_ATTEMPTS");
    this.name = "TooManyAttemptsException";
  }
}
