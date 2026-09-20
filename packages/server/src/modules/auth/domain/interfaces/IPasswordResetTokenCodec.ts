/**
 * Порт для работы с токеном сброса пароля
 */
export interface IPasswordResetTokenCodec {
  /**
   * Cоздаёт подписанный токен.
   */
  encode(userId: string): string;
  /**
   * Проверяет подпись и срок действия токена и если, все ок, то возвращает userId, иначе null.
   */
  decode(token: string): { userId: string } | null;
}
