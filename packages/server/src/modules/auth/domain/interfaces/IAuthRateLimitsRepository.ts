export type AuthRateLimitRecord = {
  /**
   * Это идентификатор того, что именно мы ограничиваем
   * @example 'password-reset:email:user@mail.com', 'login:user:123', 'login:ip:192.168.1.20'
   */
  key: string;
  /**
   * Дата когда началось текущее окно rate limit (ограничение запросов)
   */
  windowStartedAt: string;
  /**
   * Количество запросов сделанных внутри этого окна (rate limit)
   */
  requestCount: number;
  /**
   * Количество неправильных попыток
   */
  failureCount: number;
  /**
   * Это уровень блокировки
   * @description lockoutTier=1 => блокировка 1 минута
   * @description lockoutTier=2 => блокировка 5 минута
   * @description lockoutTier=3 => блокировка 15 минута
   */
  lockoutTier: number;
  /**
   * Дата отображающая до какого момента действует блокировка
   * @description Было сделано 5 ошибок => lockoutTier = 1 => блокировка 1 минута.
   * После этого было еще сделано 5 ошибок => lockoutTier = 2 => блокировка 5 минут и т.д
   */
  lockedUntil: string | null;
  /**
   * Дата обновления
   */
  updatedAt: string;
};

/**
 * Порт хранилища auth rate-limits (окна запросов + lockout).
 */
export interface IAuthRateLimitsRepository {
  /**
   * Найти состояние одного key
   */
  findByKey(key: string): Promise<AuthRateLimitRecord | null>;
  /**
   * Найти состояние нескольких key
   */
  findByKeys(keys: string[]): Promise<AuthRateLimitRecord[]>;
  /**
   * Устанавливает состояние окна запросов для запроса key
   */
  upsertRequestWindow(input: {
    key: string;
    windowStartedAt: Date;
    requestCount: number;
  }): Promise<AuthRateLimitRecord>;
  /**
   * Увеличивает счетчик числа запросов одного key
   */
  incrementRequestCount(key: string): Promise<AuthRateLimitRecord>;
  /**
   * Увеличивает счетчик числа неправильных попыток одного запроса key
   */
  incrementFailureCount(key: string): Promise<AuthRateLimitRecord>;
  /**
   * Включаем блокировку к запросу key
   */
  applyLockout(input: {
    key: string;
    lockedUntil: Date;
    lockoutTier: number;
  }): Promise<AuthRateLimitRecord>;
  /**
   * Полностью очищает состояние блокировки для одного key
   */
  resetLockout(key: string): Promise<void>;
  /**
   * Полностью очищает состояние блокировки для нескольких key
   */
  resetLockouts(keys: string[]): Promise<void>;
}
