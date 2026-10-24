import type { Context } from "hono";

export const RATE_LIMITED_MESSAGE = "RATE_LIMITED";

export const retryAfterSeconds = (retryAfter: string) =>
  Math.max(0, Math.ceil((Date.parse(retryAfter) - Date.now()) / 1000));

export const respondRateLimited = (
  c: Context,
  retryAfter: string,
  status: 200 | 429 = 429,
) => {
  c.header("Retry-After", String(retryAfterSeconds(retryAfter)));
  return c.json(
    {
      success: false,
      message: RATE_LIMITED_MESSAGE,
      data: { retryAfter },
    },
    status,
  );
};
