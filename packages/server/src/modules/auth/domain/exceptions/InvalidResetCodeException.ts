/**
 * Доменное исключение: введён неверный код подтверждения сброса пароля.
 */
export class InvalidResetCodeException extends Error {
  constructor() {
    super("INVALID_CODE");
    this.name = "InvalidResetCodeException";
  }
}
