import pg, { type Pool, type PoolConfig } from "pg";
import { config } from "../config/index.js";

const getPoolConfig = (): PoolConfig => ({
  host: process.env.DB_HOST ?? config.db.host,
  port: Number(process.env.DB_PORT ?? config.db.port),
  database: process.env.DB_NAME ?? config.db.database,
  user: process.env.DB_USER ?? config.db.user,
  password: process.env.DB_PASSWORD ?? config.db.password,
});

let poolInstance: Pool | null = null;

export const getPool = (): Pool => {
  if (!poolInstance) {
    poolInstance = new pg.Pool(getPoolConfig());
    poolInstance.on("error", () => {
      // Idle client errors during pool shutdown must not crash the process.
    });
  }

  return poolInstance;
};

export const closePool = async () => {
  if (!poolInstance) {
    return;
  }

  const instance = poolInstance;
  poolInstance = null;

  try {
    await instance.end();
  } catch {
    // Pool may already be closed (e.g. shared test teardown).
  }
};

/** Lazy singleton for app code (`pool.query(...)`). */
export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const instance = getPool();
    const value = Reflect.get(instance, prop, instance);

    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});
