/**
 * Доменное исключение: неверный логин или пароль.
 * Сообщение намеренно общее — без уточнения, что именно неверно.
 */
export class InvalidCredentialsException extends Error {
  constructor() {
    super("Login or password is not correct");
    this.name = "InvalidCredentialsException";
  }
}
