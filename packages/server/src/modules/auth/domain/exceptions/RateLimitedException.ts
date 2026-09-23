/**
 * Доменное исключение: превышен rate limit (окно запросов / lockout).
 * @param retryAfter - ISO-дата, после которой можно повторить запрос
 */
export class RateLimitedException extends Error {
  constructor(readonly retryAfter: string) {
    super("RATE_LIMITED");
    this.name = "RateLimitedException";
  }
}
