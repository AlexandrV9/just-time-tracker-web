export type PasswordResetRecord = {
  /**
   * Идентификатор пользователя, который пытается сбросить пароль
   */
  userId: string;
  /**
   * Хэш кода подтверждения
   */
  codeHash: string;
  /**
   * Cчётчик неудачных вводов кода
   */
  attemptsCount: number;
  /**
   * Дата когда истекает код
   */
  expiresAt: string;
  /**
   * Счетчик повторных отправок кода
   */
  resendCount: number;
  /**
   * Дата когда можно запросить новый код
   */
  resendAvailableAt: string;
};

/**
 * Порт хранилища password-reset кодов.
 */
export interface IPasswordResetRepository {
  /**
   * Получение попытки сброса пароля по id пользователя
   * @param userId - идентификатор пользователя
   */
  findByUserId(userId: string): Promise<PasswordResetRecord | null>;
  /**
   * Cоздание новой записи или обновление уже существующей (новый codeHash, TTL, cooldown; attempts/resend сбрасываются)
   * Используется на start.
   */
  upsert(input: {
    userId: string;
    codeHash: string;
    expiresAt: Date;
    resendAvailableAt: Date;
  }): Promise<PasswordResetRecord>;
  /**
   * Запрос на повторную отправку кода
   * (Новый codeHash, expiresAt, resendAvailableAt, attempts = 0, resendСount++)
   * Если не было такого запроса на сброс пароля, вернет null
   */
  refreshForResend(input: {
    userId: string;
    codeHash: string;
    expiresAt: Date;
    resendAvailableAt: Date;
  }): Promise<PasswordResetRecord | null>;
  /**
   * Увеличивает счетчик попыток
   */
  incrementAttempts(userId: string): Promise<number | null>;
  /**
   * Сбросить счётчик попыток (когда достигнут max и начинаем заново).
   */
  resetAttempts(userId: string): Promise<boolean>;
  /**
   * Удалить challenge (после успешного confirm или когда код expired).
   */
  deleteByUserId(userId: string): Promise<void>;
}
