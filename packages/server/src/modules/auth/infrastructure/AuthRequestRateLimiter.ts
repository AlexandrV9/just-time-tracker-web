import { config } from "shared/index.js";
import type {
  AuthRateLimitRecord,
  IAuthRateLimitsRepository,
  IRequestRateLimiter,
} from "../domain/index.js";

type RateLimitResult =
  | { blocked: false; retryAfter: string }
  | { blocked: true; retryAfter: string };

/**
 * Возвращает самую позднюю валидную дату из списка как ISO-строку.
 * Нужна, когда у одного действия несколько ключей (user + ip):
 * клиенту отдаём один retryAfter — до конца самой долгой блокировки.
 *
 * @example
 * maxRetryAfter([
 *   "2026-09-21T15:00:00.000Z",
 *   "2026-09-21T15:14:00.000Z",
 * ])
 * // → "2026-09-21T15:14:00.000Z"
 *
 * @example
 * maxRetryAfter(["2026-09-21T15:00:00.000Z", null])
 * // → "2026-09-21T15:00:00.000Z"
 *
 * @example
 * maxRetryAfter([null, undefined, "not-a-date"])
// → null
 */
const maxRetryAfter = (dates: (string | null | undefined)[]): string | null => {
  let max: number | null = null;

  for (const date of dates) {
    if (!date) continue;

    const timestamp = Date.parse(date);

    if (Number.isNaN(timestamp)) continue;

    if (max === null || timestamp > max) {
      max = timestamp;
    }
  }
  return max === null ? null : new Date(max).toISOString();
};

/**
 * Политика rate-limit поверх IAuthRateLimitsRepository
 * (окна запросов + progressive lockout по failures).
 */
export class AuthRequestRateLimiter implements IRequestRateLimiter {
  constructor(private readonly repo: IAuthRateLimitsRepository) {}

  async check(
    key: string,
    maxRequests: number,
    windowSec: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const row = await this.repo.findByKey(key);

    const windowStartMs = row ? Date.parse(row.windowStartedAt) : now;
    const windowExpired = now - windowStartMs >= windowSec * 1000;

    if (!row || windowExpired) {
      return { blocked: false, retryAfter: "" };
    }

    if (row.requestCount >= maxRequests) {
      return {
        blocked: true,
        retryAfter: new Date(windowStartMs + windowSec * 1000).toISOString(),
      };
    }

    return { blocked: false, retryAfter: "" };
  }

  async consume(key: string, windowSec: number): Promise<void> {
    const now = Date.now();
    const row = await this.repo.findByKey(key);

    // Если такого запроса не было, то создаем новое 
    // временное окно и возвращаем его
    if (!row) {
      await this.repo.upsertRequestWindow({
        key,
        windowStartedAt: new Date(now),
        requestCount: 1,
      });
      return;
    }

    // Иначе окно уже есть

    const windowStartMs = Date.parse(row.windowStartedAt);

    // Проверяет, истекло ли текущее окно rate-limit.
    // (now - windowStartMs) - сколько мс прошло с windowStartedAt
    // windowSec * 1000 - длительность окна в мс
    const windowExpired = now - windowStartMs >= windowSec * 1000;

    // Если окно истекло, создаем новое
    if (windowExpired) {
      await this.repo.upsertRequestWindow({
        key,
        windowStartedAt: new Date(now),
        requestCount: 1,
      });
      return;
    }

    // Иначе окно еще живое — тогда просто увеличиваем requestCount
    await this.repo.incrementRequestCount(key);
  }

  async checkLocked(keys: string[]): Promise<RateLimitResult> {
    const rows = await this.repo.findByKeys(keys);
    const now = Date.now();

    const isActiveLock = (rowItem: AuthRateLimitRecord): boolean => {
      return rowItem.lockedUntil === null
        ? false
        : Date.parse(rowItem.lockedUntil) > now;
    };

    // Получаем список активных дат блокировок
    const activeLocks = rows
      .filter(isActiveLock)
      .map((item) => item.lockedUntil as string);

    // Находим среди списка дат блокировок самую долгую
    const retryAfter = maxRetryAfter(activeLocks);

    // Если нашли, то вовзвращае её
    if (retryAfter) {
      return { blocked: true, retryAfter };
    }

    // Если не нашли, значит нет блокировок
    return { blocked: false, retryAfter: "" };
  }

  async recordFailure(keys: string[]): Promise<RateLimitResult> {
    const { maxFailuresBeforeLockout, lockoutDelaysSec } =
      config.rateLimit.login;

    let latestLock: RateLimitResult = { blocked: false, retryAfter: "" };

    for (const key of keys) {
      const row = await this.repo.incrementFailureCount(key);

      // Если число неуспешных попыток еще меньше порога maxFailuresBeforeLockout,
      // то не ставим блок и идем дальше
      if (row.failureCount < maxFailuresBeforeLockout) {
        continue;
      }

      // Получение уровня блокировки
      const tier = Math.min(row.lockoutTier, lockoutDelaysSec.length - 1);

      // Получения задержки блокировки
      const delaySec = lockoutDelaysSec[tier] ?? lockoutDelaysSec.at(-1)!;

      // Дата окончания блокировки
      const lockedUntil = new Date(Date.now() + delaySec * 1000);

      // Вычисялем следующий уровень блокировки (не выше максимального)
      const nextTier = Math.min(
        row.lockoutTier + 1,
        lockoutDelaysSec.length - 1,
      );

      // Включаем блокировку
      const updated = await this.repo.applyLockout({
        key,
        lockedUntil,
        lockoutTier: nextTier,
      });

      // Возвращаем последнюю блокировку
      latestLock = {
        blocked: true,
        retryAfter: updated.lockedUntil ?? lockedUntil.toISOString(),
      };
    }

    return latestLock;
  }

  async recordSuccess(keys: string[]): Promise<void> {
    await this.repo.resetLockouts(keys);
  }
}
