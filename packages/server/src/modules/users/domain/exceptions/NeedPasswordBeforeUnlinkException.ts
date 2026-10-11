/**
 * Нельзя отвязать единственный способ входа без пароля.
 */
export class NeedPasswordBeforeUnlinkException extends Error {
  constructor() {
    super("NEED_PASSWORD_BEFORE_UNLINK");
    this.name = "NeedPasswordBeforeUnlinkException";
  }
}
