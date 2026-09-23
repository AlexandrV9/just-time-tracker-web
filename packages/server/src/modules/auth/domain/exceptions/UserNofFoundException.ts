/**
 * Доменное исключение: пользователь не найден.
 */
export class UserNofFoundException extends Error {
  constructor() {
    super("USER_NOT_FOUND");
    this.name = "UserNofFoundException";
  }
}
