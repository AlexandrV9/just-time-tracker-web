/**
 * Порт для ограничения частоты запросов и блокировки
 * после серии неуспешных попыток. (Rate Limit + Lockout)
 */
export interface IRequestRateLimiter {
  /**
   * Проверяет, можно ли выполнить запрос в текущем временном окне.
   *
   * @param key - ключ ограничения
   * @param maxRequests - максимальное количество запросов в пределах окна
   * @param windowSec - длительность окна в секундах
   * @returns состояние блокировки и время, после которого запрос снова разрешён
   */
  check(
    key: string,
    maxRequests: number,
    windowSec: number,
  ): Promise<{ blocked: boolean; retryAfter: string }>;

  /**
   * Регистрирует выполненный запрос и увеличивает счётчик
   * запросов в текущем временном окне, если оно закончилось, 
   * то начинает новое окно
   * @param key - ключ ограничения
   * @param windowSec - длительность окна в секундах
   */
  consume(key: string, windowSec: number): Promise<void>;

  /**
   * Проверяет наличие активной блокировки хотя бы для одного из переданных ключей.
   * @param keys - ключи ограничений
   * @returns состояние блокировки и время её окончания
   */
  checkLocked(
    keys: string[],
  ): Promise<{ blocked: boolean; retryAfter: string }>;

  /**
   * Регистрирует неуспешную попытку для переданных ключей.
   * При достижении лимита ошибок может установить блокировку.
   * (Progressive lockout)
   * @param keys - ключи ограничений
   * @returns состояние блокировки и время её окончания
   */
  recordFailure(
    keys: string[],
  ): Promise<{ blocked: boolean; retryAfter: string }>;

  /**
   * Регистрирует успешную попытку и сбрасывает накопленные
   * ошибки и блокировки для переданных ключей.
   * (сбрасывает failureCount, lockoutTier и lockedUntil)
   * @param keys - ключи ограничений
   */
  recordSuccess(keys: string[]): Promise<void>;
}
