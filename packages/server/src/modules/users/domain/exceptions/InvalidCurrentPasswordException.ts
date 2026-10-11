/**
 * Неверный текущий пароль при смене.
 */
export class InvalidCurrentPasswordException extends Error {
  constructor() {
    super("INVALID_CURRENT_PASSWORD");
    this.name = "InvalidCurrentPasswordException";
  }
}
