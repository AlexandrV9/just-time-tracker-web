/**
 * Доменное исключение: пользователь с таким email уже зарегистрирован.
 * Выбрасывается сценарием использования при попытке повторной регистрации.
 */
export class UserAlreadyExistsException extends Error {
  /**
   * @param login - адрес электронной почты, который уже занят
   */
  constructor(login: string) {
    super(`User with login "${login}" already exists`);
    this.name = "UserAlreadyExistsException";
  }
}
