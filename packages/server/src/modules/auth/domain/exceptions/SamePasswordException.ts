/**
 * Доменное исключение: новый пароль равен старому паролю.
 */
export class SamePasswordException extends Error {
  constructor() {
    super("SAME_PASSWORD");
    this.name = "SamePasswordException";
  }
}
