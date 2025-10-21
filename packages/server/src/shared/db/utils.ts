import type { PoolClient } from "pg";
import { pool } from "./pool.js";

export interface DatabaseStatus {
  success: boolean;
  message: string;
  details?: {
    database: string;
    host: string;
    port: number;
    user: string;
    connectionTime?: number;
    timestamp: string;
  };
  error?: string;
}

export const testConnection = async (): Promise<DatabaseStatus> => {
  let client: PoolClient | null = null;
  const startTime = Date.now();

  try {
    console.log("🔌 Проверяем подключение к БД...");

    // Получаем клиент из пула
    client = await pool.connect();

    // Выполняем простой запрос для проверки
    const result = await client.query(
      "SELECT NOW() as current_time, current_database() as db_name, version() as version"
    );

    const connectionTime = Date.now() - startTime;

    console.log("✅ Подключение к БД успешно установлено");

    return {
      success: true,
      message: "Database connection successful",
      details: {
        database: result.rows[0].db_name,
        host: process.env.DB_HOST || "unknown",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || "unknown",
        connectionTime,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    const connectionTime = Date.now() - startTime;
    console.error("❌ Ошибка подключения к БД:", error);

    return {
      success: false,
      message: "Database connection failed",
      details: {
        database: process.env.DB_NAME || "unknown",
        host: process.env.DB_HOST || "unknown",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || "unknown",
        connectionTime,
        timestamp: new Date().toISOString(),
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    // Всегда отпускаем клиент обратно в пул
    if (client) {
      client.release();
    }
  }
};
