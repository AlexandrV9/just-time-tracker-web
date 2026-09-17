/**
 * Доменное исключение: пользователь не найден.
 */
export class UserNotFoundException extends Error {
  /**
   * @param userId - идентификатор пользователя, которого не получилось найти
   */
  constructor(userId: string) {
    super(`User with id "${userId}" not found`);
    this.name = "UserNotFoundException";
  }
}
