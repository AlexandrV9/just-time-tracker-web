import { pool } from "../db/pool.js";

export type RateLimitRow = {
  key: string;
  windowStartedAt: string;
  requestCount: number;
  failureCount: number;
  lockoutTier: number;
  lockedUntil: string | null;
  updatedAt: string;
};

const SELECT_COLUMNS = `
  key,
  window_started_at AS "windowStartedAt",
  request_count AS "requestCount",
  failure_count AS "failureCount",
  lockout_tier AS "lockoutTier",
  locked_until AS "lockedUntil",
  updated_at AS "updatedAt"
`;

const findByKey = async (key: string): Promise<RateLimitRow | null> => {
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM auth_rate_limits WHERE key = $1`,
    [key],
  );
  return (rows[0] as RateLimitRow | undefined) ?? null;
};

const findByKeys = async (keys: string[]): Promise<RateLimitRow[]> => {
  if (keys.length === 0) return [];
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM auth_rate_limits WHERE key = ANY($1::text[])`,
    [keys],
  );
  return rows as RateLimitRow[];
};

const upsertRequestWindow = async (input: {
  key: string;
  windowStartedAt: Date;
  requestCount: number;
}) => {
  const { rows } = await pool.query(
    `
    INSERT INTO auth_rate_limits (key, window_started_at, request_count)
    VALUES ($1, $2, $3)
    ON CONFLICT (key) DO UPDATE
    SET
      window_started_at = EXCLUDED.window_started_at,
      request_count = EXCLUDED.request_count,
      updated_at = NOW()
    RETURNING ${SELECT_COLUMNS}
    `,
    [input.key, input.windowStartedAt.toISOString(), input.requestCount],
  );
  return rows[0] as RateLimitRow;
};

const incrementRequestCount = async (input: {
  key: string;
  windowStartedAt: Date;
}) => {
  const { rows } = await pool.query(
    `
    INSERT INTO auth_rate_limits (key, window_started_at, request_count)
    VALUES ($1, $2, 1)
    ON CONFLICT (key) DO UPDATE
    SET
      request_count = auth_rate_limits.request_count + 1,
      updated_at = NOW()
    RETURNING ${SELECT_COLUMNS}
    `,
    [input.key, input.windowStartedAt.toISOString()],
  );
  return rows[0] as RateLimitRow;
};

const incrementFailureCount = async (key: string) => {
  const { rows } = await pool.query(
    `
    INSERT INTO auth_rate_limits (key, failure_count)
    VALUES ($1, 1)
    ON CONFLICT (key) DO UPDATE
    SET
      failure_count = auth_rate_limits.failure_count + 1,
      updated_at = NOW()
    RETURNING ${SELECT_COLUMNS}
    `,
    [key],
  );
  return rows[0] as RateLimitRow;
};

const applyLockout = async (input: {
  key: string;
  lockedUntil: Date;
  lockoutTier: number;
}) => {
  const { rows } = await pool.query(
    `
    INSERT INTO auth_rate_limits (key, locked_until, lockout_tier, failure_count)
    VALUES ($1, $2, $3, 0)
    ON CONFLICT (key) DO UPDATE
    SET
      locked_until = EXCLUDED.locked_until,
      lockout_tier = EXCLUDED.lockout_tier,
      failure_count = 0,
      updated_at = NOW()
    RETURNING ${SELECT_COLUMNS}
    `,
    [input.key, input.lockedUntil.toISOString(), input.lockoutTier],
  );
  return rows[0] as RateLimitRow;
};

const resetLockout = async (key: string) => {
  await pool.query(
    `
    UPDATE auth_rate_limits
    SET
      failure_count = 0,
      lockout_tier = 0,
      locked_until = NULL,
      updated_at = NOW()
    WHERE key = $1
    `,
    [key],
  );
};

const resetLockouts = async (keys: string[]) => {
  if (keys.length === 0) return;
  await pool.query(
    `
    UPDATE auth_rate_limits
    SET
      failure_count = 0,
      lockout_tier = 0,
      locked_until = NULL,
      updated_at = NOW()
    WHERE key = ANY($1::text[])
    `,
    [keys],
  );
};

export const rateLimitQueries = {
  findByKey,
  findByKeys,
  upsertRequestWindow,
  incrementRequestCount,
  incrementFailureCount,
  applyLockout,
  resetLockout,
  resetLockouts,
};
