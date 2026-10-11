/**
 * Порт очистки push-подписок пользователя (при отключении уведомлений).
 */
export interface IPushSubscriptionCleaner {
  deleteByUserId(userId: string): Promise<void>;
}
