/**
 * Пароль ещё не установлен (нужен set, не update).
 */
export class PasswordNotSetException extends Error {
  constructor() {
    super("PASSWORD_NOT_SET");
    this.name = "PasswordNotSetException";
  }
}
