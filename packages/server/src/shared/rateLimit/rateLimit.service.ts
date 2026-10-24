import { config } from "../config/index.js";
import { rateLimitQueries } from "./rateLimit.queries.js";

export type RateLimitCheckResult =
  | { blocked: false }
  | { blocked: true; retryAfter: string };

const maxRetryAfter = (dates: (string | null | undefined)[]): string | null => {
  let max: number | null = null;
  for (const date of dates) {
    if (!date) continue;
    const ts = Date.parse(date);
    if (Number.isNaN(ts)) continue;
    if (max === null || ts > max) max = ts;
  }
  return max === null ? null : new Date(max).toISOString();
};

const checkLocked = async (keys: string[]): Promise<RateLimitCheckResult> => {
  const rows = await rateLimitQueries.findByKeys(keys);
  const now = Date.now();
  const activeLocks = rows
    .map((row) => row.lockedUntil)
    .filter((lockedUntil): lockedUntil is string => {
      if (!lockedUntil) return false;
      return Date.parse(lockedUntil) > now;
    });

  const retryAfter = maxRetryAfter(activeLocks);
  if (retryAfter) {
    return { blocked: true, retryAfter };
  }

  return { blocked: false };
};

const checkRequestLimit = async (
  key: string,
  maxRequests: number,
  windowSec: number,
): Promise<RateLimitCheckResult> => {
  const now = Date.now();
  const row = await rateLimitQueries.findByKey(key);
  const windowStartMs = row
    ? Date.parse(row.windowStartedAt)
    : now;
  const windowExpired = now - windowStartMs >= windowSec * 1000;

  if (!row || windowExpired) {
    return { blocked: false };
  }

  if (row.requestCount >= maxRequests) {
    const retryAfter = new Date(windowStartMs + windowSec * 1000).toISOString();
    return { blocked: true, retryAfter };
  }

  return { blocked: false };
};

const consumeRequest = async (key: string, windowSec: number) => {
  const now = Date.now();
  const row = await rateLimitQueries.findByKey(key);

  if (!row) {
    await rateLimitQueries.upsertRequestWindow({
      key,
      windowStartedAt: new Date(now),
      requestCount: 1,
    });
    return;
  }

  const windowStartMs = Date.parse(row.windowStartedAt);
  const windowExpired = now - windowStartMs >= windowSec * 1000;

  if (windowExpired) {
    await rateLimitQueries.upsertRequestWindow({
      key,
      windowStartedAt: new Date(now),
      requestCount: 1,
    });
    return;
  }

  await rateLimitQueries.incrementRequestCount({
    key,
    windowStartedAt: new Date(windowStartMs),
  });
};

const recordFailure = async (
  keys: string[],
): Promise<RateLimitCheckResult> => {
  const { maxFailuresBeforeLockout, lockoutDelaysSec } = config.rateLimit.login;
  let latestLock: RateLimitCheckResult = { blocked: false };

  for (const key of keys) {
    const row = await rateLimitQueries.incrementFailureCount(key);

    if (row.failureCount < maxFailuresBeforeLockout) {
      continue;
    }

    const tier = Math.min(row.lockoutTier, lockoutDelaysSec.length - 1);
    const delaySec = lockoutDelaysSec[tier] ?? lockoutDelaysSec.at(-1)!;
    const lockedUntil = new Date(Date.now() + delaySec * 1000);
    const nextTier = Math.min(row.lockoutTier + 1, lockoutDelaysSec.length - 1);

    const updated = await rateLimitQueries.applyLockout({
      key,
      lockedUntil,
      lockoutTier: nextTier,
    });

    const retryAfter = updated.lockedUntil ?? lockedUntil.toISOString();
    latestLock = { blocked: true, retryAfter };
  }

  return latestLock;
};

const recordSuccess = async (keys: string[]) => {
  await rateLimitQueries.resetLockouts(keys);
};

const checkAndConsumeRequest = async (
  key: string,
  maxRequests: number,
  windowSec: number,
): Promise<RateLimitCheckResult> => {
  const limitCheck = await checkRequestLimit(key, maxRequests, windowSec);
  if (limitCheck.blocked) {
    return limitCheck;
  }

  await consumeRequest(key, windowSec);
  return { blocked: false };
};

export const rateLimitService = {
  checkLocked,
  checkRequestLimit,
  consumeRequest,
  checkAndConsumeRequest,
  recordFailure,
  recordSuccess,
};
