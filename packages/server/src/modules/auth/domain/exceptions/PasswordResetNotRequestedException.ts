/**
 * Доменное исключение: для пользователя не было запроса на сброс пароля.
 */
export class PasswordResetNotRequestedException extends Error {
  constructor() {
    super("PASSWORD_RESET_NOT_REQUESTED");
    this.name = "PasswordResetNotRequestedException";
  }
}
