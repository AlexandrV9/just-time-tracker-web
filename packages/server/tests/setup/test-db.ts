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
      id SERIAL PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_active BOOLEAN NOT NULL DEFAULT true,
      login VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) UNIQUE,
      avatar TEXT
    );
  `);
};

export const resetUsersTables = async (pool: Pool) => {
  await pool.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
};

const createTestDatabase = async (
  container: StartedPostgreSqlContainer | null,
): Promise<TestDatabase> => {
  const { getPool, closePool } = await import("../../src/shared/db/pool.js");

  await closePool();

  const pool = getPool();

  await setupActivitiesSchema(pool);
  await setupUsersSchema(pool);

  return {
    container,
    pool,
    stop: async () => {
      await closePool();

      if (container) {
        await container.stop();
      }
    },
  };
};

const startWithTestcontainers = async (): Promise<TestDatabase> => {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("test_db")
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

  const testDbName = process.env.TEST_DB_NAME ?? "test_db";

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

export const startTestDatabase = async (): Promise<TestDatabase> => {
  if (process.env.TEST_DATABASE_URL) {
    configureDatabaseEnvFromUrl(process.env.TEST_DATABASE_URL);
    return createTestDatabase(null);
  }

  if (process.env.USE_TESTCONTAINERS === "true") {
    return startWithTestcontainers();
  }

  const fromEnv = await startFromEnv();

  if (fromEnv) {
    return fromEnv;
  }

  throw new Error(
    [
      "Postgres для интеграционных тестов недоступен.",
      "Запусти БД: docker compose -f .docker/docker-compose.yaml up -d postgres",
      "Или задай TEST_DATABASE_URL / USE_TESTCONTAINERS=true",
    ].join("\n"),
  );
};
