/**
 * Доменное исключение: неверный логин или пароль.
 */
export class InvalidCredentialsException extends Error {
  constructor() {
    super("Login or password is not correct");
    this.name = "InvalidCredentialsException";
  }
}
