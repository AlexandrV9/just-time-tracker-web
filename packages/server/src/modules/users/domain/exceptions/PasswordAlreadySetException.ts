/**
 * Пароль уже установлен (setPassword недоступен).
 */
export class PasswordAlreadySetException extends Error {
  constructor() {
    super("PASSWORD_ALREADY_SET");
    this.name = "PasswordAlreadySetException";
  }
}
