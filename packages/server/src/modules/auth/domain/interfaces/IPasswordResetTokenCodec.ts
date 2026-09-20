/**
 * Кодирует и декодирует одноразовый токен сброса пароля.
 *
 * `encode` создаёт подписанный токен с ограниченным сроком жизни;
 * `decode` проверяет подпись и срок действия и если, все ок, то возвращает userId,
 *  иначе null.
 */
export interface IPasswordResetTokenCodec {
  encode(userId: string): string;
  decode(token: string): { userId: string } | null;
}
