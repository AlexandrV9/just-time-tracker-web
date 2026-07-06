import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import pg, { type Pool, type PoolConfig } from "pg";

export type TestDatabase = {
  container: StartedPostgreSqlContainer | null;
  pool: Pool;
  stop: () => Promise<void>;
};

const CONNECTION_TIMEOUT_MS = 5_000;
const TESTCONTAINERS_TIMEOUT_MS = 180_000;
export const DEFAULT_TEST_DB_NAME = "time_tracker_test";

type SavedDbEnv = {
  DB_HOST?: string;
  DB_PORT?: string;
  DB_NAME?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
};

let savedDbEnv: SavedDbEnv | null = null;

export const normalizeEnvValue = (value?: string) =>
  value?.trim().replace(/^(['"])(.*)\1$/, "$2") ?? "";

export const isEnvTruthy = (value?: string) => {
  const normalized = normalizeEnvValue(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const getProtectedDatabaseNames = (): string[] => {
  const fromEnv =
    normalizeEnvValue(process.env.DEV_DB_PROTECT) || "time_tracker";

  return [
    ...new Set(
      fromEnv
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
};

export const assertSafeTestDatabase = async (pool: Pool) => {
  const { rows } = await pool.query<{ current_database: string }>(
    "SELECT current_database()",
  );
  const currentDatabase = rows[0]?.current_database;
  const protectedNames = getProtectedDatabaseNames();

  if (currentDatabase && protectedNames.includes(currentDatabase)) {
    throw new Error(
      [
        `Refusing to modify protected database "${currentDatabase}".`,
        "Use USE_TESTCONTAINERS=true (default in .env.test) or TEST_DB_NAME on a separate database.",
        `Protected: ${protectedNames.join(", ")}`,
      ].join("\n"),
    );
  }
};

const saveDbEnv = () => {
  if (savedDbEnv) return;

  savedDbEnv = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
  };
};

const restoreDbEnv = () => {
  if (!savedDbEnv) return;

  for (const key of Object.keys(savedDbEnv) as (keyof SavedDbEnv)[]) {
    const value = savedDbEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  savedDbEnv = null;
};

export const configureDatabaseEnv = (container: StartedPostgreSqlContainer) => {
  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = String(container.getFirstMappedPort());
  process.env.DB_NAME = container.getDatabase();
  process.env.DB_USER = container.getUsername();
  process.env.DB_PASSWORD = container.getPassword();
};

const configureDatabaseEnvFromUrl = (connectionUrl: string) => {
  const url = new URL(connectionUrl);

  process.env.DB_HOST = url.hostname;
  process.env.DB_PORT = url.port || "5432";
  process.env.DB_NAME = url.pathname.replace(/^\//, "");
  process.env.DB_USER = decodeURIComponent(url.username);
  process.env.DB_PASSWORD = decodeURIComponent(url.password);
};

const getBasePoolConfig = (): PoolConfig => ({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const probeConnection = async (config: PoolConfig): Promise<boolean> => {
  const client = new pg.Client(config);

  try {
    await Promise.race([
      client.connect(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("connection timeout")),
          CONNECTION_TIMEOUT_MS,
        ),
      ),
    ]);

    await client.end();
    return true;
  } catch {
    try {
      await client.end();
    } catch {
      // ignore
    }

    return false;
  }
};

const ensureTestDatabase = async (testDbName: string) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(testDbName)) {
    throw new Error(`Invalid TEST_DB_NAME: ${testDbName}`);
  }

  const adminPool = new pg.Pool({
    ...getBasePoolConfig(),
    database: "postgres",
  });

  try {
    const { rows } = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [testDbName],
    );

    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${testDbName}`);
    }
  } finally {
    await adminPool.end();
  }
};

export const setupActivitiesSchema = async (pool: Pool) => {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description VARCHAR(1000),
      created_by_id TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      last_activity_session_id UUID,
      active_duration_ms BIGINT NOT NULL DEFAULT 0,
      pause_duration_ms BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT activities_tags_max_10 CHECK (cardinality(tags) <= 10)
    );

    CREATE TABLE IF NOT EXISTS activity_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      started_at TIMESTAMPTZ NOT NULL,
      ended_at TIMESTAMPTZ,
      status VARCHAR(20) NOT NULL
        CHECK (status IN ('active', 'paused', 'finished')),
      active_duration_ms BIGINT NOT NULL DEFAULT 0,
      pause_duration_ms BIGINT NOT NULL DEFAULT 0,
      current_segment_id UUID
    );

    CREATE TABLE IF NOT EXISTS activity_session_segments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      session_id UUID NOT NULL REFERENCES activity_sessions(id) ON DELETE CASCADE,
      segment_type VARCHAR(10) NOT NULL
        CHECK (segment_type IN ('active', 'pause')),
      started_at TIMESTAMPTZ NOT NULL,
      ended_at TIMESTAMPTZ
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'activities_last_activity_session_id_fkey'
      ) THEN
        ALTER TABLE activities
          ADD CONSTRAINT activities_last_activity_session_id_fkey
          FOREIGN KEY (last_activity_session_id)
          REFERENCES activity_sessions(id)
          ON DELETE SET NULL;
      END IF;
    END $$;
  `);
};

export const resetActivitiesTables = async (pool: Pool) => {
  await assertSafeTestDatabase(pool);

  await pool.query(`
    TRUNCATE TABLE
      activity_session_segments,
      activity_sessions,
      activities
    RESTART IDENTITY CASCADE
  `);
};

export const setupUsersSchema = async (pool: Pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      password_hash VARCHAR(255),
      first_name VARCHAR(255) NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_active BOOLEAN NOT NULL DEFAULT true,
      login VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) UNIQUE,
      email_verified_at TIMESTAMPTZ,
      avatar TEXT,
      locale VARCHAR(5) NOT NULL DEFAULT 'en',
      push_notifications_enabled BOOLEAN NOT NULL DEFAULT true
    );

    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS locale VARCHAR(5) NOT NULL DEFAULT 'en',
      ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN NOT NULL DEFAULT true;

    CREATE TABLE IF NOT EXISTS auth_providers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider VARCHAR(50) NOT NULL,
      provider_user_id VARCHAR(255) NOT NULL,
      disconnected_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (provider, provider_user_id)
    );

    ALTER TABLE auth_providers
      ADD COLUMN IF NOT EXISTS disconnected_at TIMESTAMPTZ;

    CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_providers_active_user_provider
      ON auth_providers (user_id, provider)
      WHERE disconnected_at IS NULL;

    CREATE TABLE IF NOT EXISTS email_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      new_email VARCHAR(255) NOT NULL,
      code_hash VARCHAR(255) NOT NULL,
      attempts_count INT NOT NULL DEFAULT 0,
      resend_count INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      resend_available_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_email_verifications_user_id
      ON email_verifications(user_id);

    CREATE TABLE IF NOT EXISTS password_resets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash VARCHAR(255) NOT NULL,
      attempts_count INT NOT NULL DEFAULT 0,
      resend_count INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      resend_available_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_password_resets_user_id
      ON password_resets(user_id);

    CREATE TABLE IF NOT EXISTS user_email_daily_sends (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day DATE NOT NULL,
      send_count INT NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day),
      CONSTRAINT user_email_daily_sends_count_positive CHECK (send_count >= 0)
    );

    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      key TEXT PRIMARY KEY,
      window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      request_count INT NOT NULL DEFAULT 0,
      failure_count INT NOT NULL DEFAULT 0,
      lockout_tier INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS auth_rate_limits_locked_until_idx
      ON auth_rate_limits (locked_until)
      WHERE locked_until IS NOT NULL;
  `);
};

export const resetUsersTables = async (pool: Pool) => {
  await assertSafeTestDatabase(pool);

  await pool.query(
    `TRUNCATE TABLE auth_rate_limits, user_email_daily_sends, password_resets, email_verifications, auth_providers, users RESTART IDENTITY CASCADE`,
  );
};

export const setupNotificationsSchema = async (pool: Pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      payload JSONB,
      send_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT notification_jobs_status_check
        CHECK (status IN ('pending', 'sent', 'failed', 'canceled'))
    );

    CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_send_at
      ON notification_jobs(status, send_at);

    CREATE INDEX IF NOT EXISTS idx_notification_jobs_user_id
      ON notification_jobs(user_id);

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
      ON push_subscriptions(endpoint);

    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
      ON push_subscriptions(user_id);

    CREATE TABLE IF NOT EXISTS activity_settings (
      activity_id UUID PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
      session_goal_seconds INT NOT NULL DEFAULT 5400,
      notify_on_goal_reached BOOLEAN NOT NULL DEFAULT false,
      notify_on_long_pause BOOLEAN NOT NULL DEFAULT false,
      long_pause_threshold_seconds INT NOT NULL DEFAULT 1800,
      notify_on_long_activity BOOLEAN NOT NULL DEFAULT false,
      long_activity_threshold_seconds INT NOT NULL DEFAULT 1800,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT activity_settings_session_goal_positive
        CHECK (session_goal_seconds > 0),
      CONSTRAINT activity_settings_long_pause_threshold_positive
        CHECK (long_pause_threshold_seconds > 0),
      CONSTRAINT activity_settings_long_activity_threshold_positive
        CHECK (long_activity_threshold_seconds > 0)
    );
  `);
};

export const resetNotificationsTables = async (pool: Pool) => {
  await assertSafeTestDatabase(pool);

  await pool.query(`
    TRUNCATE TABLE notification_jobs, push_subscriptions RESTART IDENTITY CASCADE
  `);
};

export const setupActivitySettingsSchema = async (pool: Pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_settings (
      activity_id UUID PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
      session_goal_seconds INT NOT NULL DEFAULT 5400,
      notify_on_goal_reached BOOLEAN NOT NULL DEFAULT false,
      notify_on_long_pause BOOLEAN NOT NULL DEFAULT false,
      long_pause_threshold_seconds INT NOT NULL DEFAULT 1800,
      notify_on_long_activity BOOLEAN NOT NULL DEFAULT false,
      long_activity_threshold_seconds INT NOT NULL DEFAULT 1800,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT activity_settings_session_goal_positive
        CHECK (session_goal_seconds > 0),
      CONSTRAINT activity_settings_long_pause_threshold_positive
        CHECK (long_pause_threshold_seconds > 0),
      CONSTRAINT activity_settings_long_activity_threshold_positive
        CHECK (long_activity_threshold_seconds > 0)
    );
  `);
};

const createTestDatabase = async (
  container: StartedPostgreSqlContainer | null,
): Promise<TestDatabase> => {
  saveDbEnv();

  const testConnectionEnv: SavedDbEnv = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
  };

  const { getPool, closePool } = await import("../../src/shared/db/pool.js");

  for (const [key, value] of Object.entries(testConnectionEnv)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }

  await closePool();

  const pool = getPool();

  await setupActivitiesSchema(pool);
  await setupUsersSchema(pool);
  await setupNotificationsSchema(pool);
  await setupActivitySettingsSchema(pool);

  await assertSafeTestDatabase(pool);

  const { rows } = await pool.query<{ current_database: string }>(
    "SELECT current_database()",
  );
  console.info(
    `[tests] Using database "${rows[0]?.current_database ?? "unknown"}"${container ? " (Testcontainers)" : ""}`,
  );

  return {
    container,
    pool,
    stop: async () => {
      pool.on("error", () => undefined);

      const { closePool } = await import("../../src/shared/db/pool.js");
      await closePool();

      if (container) {
        await container.stop();
      }
    },
  };
};

const startWithTestcontainers = async (): Promise<TestDatabase> => {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase(DEFAULT_TEST_DB_NAME)
    .withUsername("test")
    .withPassword("test")
    .withStartupTimeout(TESTCONTAINERS_TIMEOUT_MS)
    .start();

  configureDatabaseEnv(container);

  return createTestDatabase(container);
};

const startFromEnv = async (): Promise<TestDatabase | null> => {
  const { DB_HOST, DB_USER, DB_PASSWORD } = process.env;

  if (!DB_HOST || !DB_USER || DB_PASSWORD === undefined) {
    return null;
  }

  const testDbName =
    normalizeEnvValue(process.env.TEST_DB_NAME) || DEFAULT_TEST_DB_NAME;

  if (getProtectedDatabaseNames().includes(testDbName)) {
    throw new Error(
      `TEST_DB_NAME "${testDbName}" is protected (DEV_DB_PROTECT). Use Testcontainers or another database name.`,
    );
  }

  const canReachPostgres = await probeConnection({
    ...getBasePoolConfig(),
    database: "postgres",
  });

  if (!canReachPostgres) {
    return null;
  }

  await ensureTestDatabase(testDbName);

  process.env.DB_NAME = testDbName;

  const canReachTestDb = await probeConnection({
    ...getBasePoolConfig(),
    database: testDbName,
  });

  if (!canReachTestDb) {
    return null;
  }

  return createTestDatabase(null);
};

let sharedTestDb: TestDatabase | null = null;
let sharedTestDbInit: Promise<TestDatabase> | null = null;
let sharedTestDbRefs = 0;

const bootstrapTestDatabase = async (): Promise<TestDatabase> => {
  if (process.env.TEST_DATABASE_URL) {
    configureDatabaseEnvFromUrl(process.env.TEST_DATABASE_URL);
    return createTestDatabase(null);
  }

  if (isEnvTruthy(process.env.USE_TESTCONTAINERS)) {
    return startWithTestcontainers();
  }

  const fromEnv = await startFromEnv();

  if (fromEnv) {
    return fromEnv;
  }

  throw new Error(
    [
      "Postgres для интеграционных тестов недоступен.",
      "По умолчанию нужен Docker: USE_TESTCONTAINERS=true (см. .env.test).",
      "Fallback: docker compose -f .docker/docker-compose.yaml up -d postgres + TEST_DB_NAME=time_tracker_test",
      "Или задай TEST_DATABASE_URL.",
    ].join("\n"),
  );
};

/** Shared Postgres for all integration test files (one container / one pool). */
export const startTestDatabase = async (): Promise<TestDatabase> => {
  if (!sharedTestDbInit) {
    sharedTestDbInit = bootstrapTestDatabase().then((db) => {
      sharedTestDb = db;
      return db;
    });
  }

  const db = await sharedTestDbInit;
  sharedTestDbRefs++;
  return db;
};

export const releaseTestDatabase = async (): Promise<void> => {
  sharedTestDbRefs = Math.max(0, sharedTestDbRefs - 1);
  if (sharedTestDbRefs > 0) return;

  if (sharedTestDb) {
    await sharedTestDb.stop();
    sharedTestDb = null;
    sharedTestDbInit = null;
  }

  restoreDbEnv();
};
