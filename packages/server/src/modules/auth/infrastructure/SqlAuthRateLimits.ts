import type { Pool } from "pg";
import { pool as defaultPool } from "shared/index.js";
import type {
  AuthRateLimitRecord,
  IAuthRateLimitsRepository,
} from "../domain/index.js";

interface AuthRateLimitRow {
  key: string;
  windowStartedAt: string;
  requestCount: number;
  failureCount: number;
  lockoutTier: number;
  lockedUntil: string | null;
  updatedAt: string;
}

const SELECT_COLUMNS = `
  key,
  window_started_at AS "windowStartedAt",
  request_count AS "requestCount",
  failure_count AS "failureCount",
  lockout_tier AS "lockoutTier",
  locked_until AS "lockedUntil",
  updated_at AS "updatedAt"
`;

/**
 * SQL-доступ к таблице auth_rate_limits.
 */
export class SqlAuthRateLimits implements IAuthRateLimitsRepository {
  private readonly pool: Pool;

  constructor(pool: Pool = defaultPool) {
    this.pool = pool;
  }

  /**
   * Создаёт таблицу auth_rate_limits и индекс, если их ещё нет.
   * Вызывать при bootstrap / в тестах — не из конструктора (query async).
   */
  async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS auth_rate_limits (
        key TEXT PRIMARY KEY,
        window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        request_count INT NOT NULL DEFAULT 0,
        failure_count INT NOT NULL DEFAULT 0,
        lockout_tier INT NOT NULL DEFAULT 0,
        locked_until TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS auth_rate_limits_locked_until_idx
        ON auth_rate_limits (locked_until)
        WHERE locked_until IS NOT NULL
    `);
  }

  async findByKey(key: string): Promise<AuthRateLimitRecord | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLUMNS} FROM auth_rate_limits WHERE key = $1`,
      [key],
    );

    const row = rows[0] as AuthRateLimitRow | undefined;
    return row ? this.toEntity(row) : null;
  }

  async findByKeys(keys: string[]): Promise<AuthRateLimitRecord[]> {
    if (keys.length === 0) {
      return [];
    }

    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLUMNS} FROM auth_rate_limits WHERE key = ANY($1::text[])`,
      [keys],
    );

    return (rows as AuthRateLimitRow[]).map(this.toEntity);
  }

  async upsertRequestWindow(input: {
    key: string;
    windowStartedAt: Date;
    requestCount: number;
  }): Promise<AuthRateLimitRecord> {
    const { rows } = await this.pool.query(
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

    return this.toEntity(rows[0] as AuthRateLimitRow);
  }

  async incrementRequestCount(key: string): Promise<AuthRateLimitRecord> {
    const { rows } = await this.pool.query(
      `
        INSERT INTO auth_rate_limits (key, request_count)
        VALUES ($1, 1)
        ON CONFLICT (key) DO UPDATE
        SET
          request_count = auth_rate_limits.request_count + 1,
          updated_at = NOW()
        RETURNING ${SELECT_COLUMNS}
      `,
      [key],
    );

    return this.toEntity(rows[0] as AuthRateLimitRow);
  }

  async incrementFailureCount(key: string): Promise<AuthRateLimitRecord> {
    const { rows } = await this.pool.query(
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

    return this.toEntity(rows[0] as AuthRateLimitRow);
  }

  async applyLockout(input: {
    key: string;
    lockedUntil: Date;
    lockoutTier: number;
  }): Promise<AuthRateLimitRecord> {
    const { rows } = await this.pool.query(
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

    return this.toEntity(rows[0] as AuthRateLimitRow);
  }

  async resetLockout(key: string): Promise<void> {
    await this.pool.query(
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
  }

  async resetLockouts(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    await this.pool.query(
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
  }

  private toEntity = (row: AuthRateLimitRow): AuthRateLimitRecord => ({
    key: row.key,
    windowStartedAt: row.windowStartedAt,
    requestCount: row.requestCount,
    failureCount: row.failureCount,
    lockoutTier: row.lockoutTier,
    lockedUntil: row.lockedUntil,
    updatedAt: row.updatedAt,
  });
}
