/**
 * Доменное исключение: невалидный или просроченный password-reset токен.
 */
export class ResetTokenInvalidException extends Error {
  constructor() {
    super("RESET_TOKEN_INVALID");
    this.name = "ResetTokenInvalidException";
  }
}
