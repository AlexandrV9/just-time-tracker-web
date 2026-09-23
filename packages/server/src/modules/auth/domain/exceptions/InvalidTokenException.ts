/**
 * Доменное исключение: refresh/access токен невалиден или просрочен.
 */
export class InvalidTokenException extends Error {
  constructor(message = "Invalid token") {
    super(message);
    this.name = "InvalidTokenException";
  }
}
