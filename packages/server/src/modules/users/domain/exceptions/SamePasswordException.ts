/**
 * Новый пароль совпадает со старым.
 */
export class SamePasswordException extends Error {
  constructor() {
    super("SAME_PASSWORD");
    this.name = "SamePasswordException";
  }
}
