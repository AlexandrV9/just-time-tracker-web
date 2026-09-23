/**
 * Доменное исключение: не найдена запись (challenge) сброса пароля.
 */
export class ResetCodeNotFoundException extends Error {
  constructor() {
    super("CODE_NOT_FOUND");
    this.name = "ResetCodeNotFoundException";
  }
}
