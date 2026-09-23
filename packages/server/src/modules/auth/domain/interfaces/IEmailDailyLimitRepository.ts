/**
 * Порт хранилища дневных лимитов отправки email (user_email_daily_sends).
 */
export interface IEmailDailyLimitRepository {
  /**
   * Получить количество отправок за день (0, если записи нет).
   */
  getSendCount(userId: string, day?: string): Promise<number>;

  /**
   * Попытайся зарезервировать право на отправку ещё одного письма, 
   * но только если дневной лимит ещё не исчерпан.
   * Атомарно резервирует один слот отправки.
   * @returns false, если дневной лимит уже достигнут
   */
  tryConsumeSendSlot(
    userId: string,
    limit: number,
    day?: string,
  ): Promise<boolean>;

  /**
   * Отменяет зарезервированный слот (если send упал).
   */
  releaseSendSlot(userId: string, day?: string): Promise<void>;

  /**
   * Просто увеличивает счетчик send_count (без проверки лимита).
   */
  incrementSendCount(userId: string, day?: string): Promise<void>;
}
