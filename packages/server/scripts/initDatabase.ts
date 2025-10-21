import { pool } from "../src/shared/index.js";

export const databaseSetup = async (): Promise<void> => {
  const dbName = process.env.DB_NAME || "tasks";

  try {
    console.log("🔍 Проверяем существование базы данных...");

    // Проверяем, существует ли БД
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;

    const result = await pool.query(checkDbQuery, [dbName]);

    if (result.rows.length === 0) {
      console.log(`📦 База данных "${dbName}" не найдена. Создаем...`);

      // Создаем БД
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ База данных "${dbName}" успешно создана`);
    } else {
      console.log(`✅ База данных "${dbName}" уже существует`);
    }
  } catch (error) {
    console.error("❌ Ошибка при создании базы данных:", error);
    throw error;
  } finally {
    await pool.end();
  }
};

const initDatabase = async (): Promise<void> => {
  try {
    console.log("🚀 Запуск инициализации базы данных...");

    // Шаг 1: Проверяем и создаем БД если нужно
    await databaseSetup();

    // Шаг 2: Создаем таблицы
    // await tableSetup();

    console.log("🎉 Инициализация базы данных завершена успешно!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Ошибка инициализации базы данных:", error);
    process.exit(1);
  }
};

// Запускаем если файл вызван напрямую
if (require.main === module) {
  initDatabase();
}

export { initDatabase };
