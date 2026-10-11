import pg from "pg";
import { config } from "shared/config/index.js";

const DB_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const ensureDatabase = async () => {
  const database = process.env.DB_NAME ?? config.db.database;

  if (!database || !DB_NAME_PATTERN.test(database)) {
    throw new Error(`Invalid DB_NAME: ${String(database)}`);
  }

  const adminPool = new pg.Pool({
    host: process.env.DB_HOST ?? config.db.host,
    port: Number(process.env.DB_PORT ?? config.db.port),
    user: process.env.DB_USER ?? config.db.user,
    password: process.env.DB_PASSWORD ?? config.db.password,
    database: "postgres",
  });

  try {
    const { rows } = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [database],
    );

    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${database}`);
      console.log(`✅ База данных '${database}' создана`);
    }
  } finally {
    await adminPool.end();
  }
};
