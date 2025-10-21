import { pool } from "../../database/config.js";

export const setupUsersTable = async () => {
  try {
    console.log("🔍 Проверяем существование таблицы users...");

    // Проверяем существует ли таблица users
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;

    const result = await pool.query(checkTableQuery);
    const tableExists = result.rows[0].exists;

    if (!tableExists) {
      console.log("📦 Таблица users не найдена. Создаем...");

      // Создаем таблицу users
      const createTableQuery = `
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await pool.query(createTableQuery);
      console.log("✅ Таблица users успешно создана");

      // Создаем индексы для users
      await pool.query("CREATE INDEX idx_users_username ON users(username)");
      await pool.query("CREATE INDEX idx_users_email ON users(email)");
      console.log("✅ Индексы для таблицы users созданы");
    } else {
      console.log("✅ Таблица users уже существует");
    }
  } catch (error) {
    console.error("❌ Ошибка при создании таблицы users:", error);
    throw error;
  }
};

export const setupTasksTable = async () => {
  try {
    console.log("🔍 Проверяем существование таблицы tasks...");

    // Проверяем существует ли таблица tasks
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
      );
    `;

    const result = await pool.query(checkTableQuery);
    const tableExists = result.rows[0].exists;

    if (!tableExists) {
      console.log("📦 Таблица tasks не найдена. Создаем...");

      // Создаем таблицу tasks с внешним ключом на users
      const createTableQuery = `
        CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT FALSE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await pool.query(createTableQuery);
      console.log("✅ Таблица tasks успешно создана");

      // Создаем индексы для tasks
      await pool.query("CREATE INDEX idx_tasks_completed ON tasks(completed)");
      await pool.query(
        "CREATE INDEX idx_tasks_created_at ON tasks(created_at)"
      );
      await pool.query("CREATE INDEX idx_tasks_user_id ON tasks(user_id)");
      console.log("✅ Индексы для таблицы tasks созданы");
    } else {
      console.log("✅ Таблица tasks уже существует");
    }
  } catch (error) {
    console.error("❌ Ошибка при создании таблицы tasks:", error);
    throw error;
  }
};

export const setupAllTables = async () => {
  try {
    console.log("🚀 Запуск инициализации таблиц...");

    // Сначала создаем users, так как tasks ссылается на users
    await setupUsersTable();
    await setupTasksTable();

    console.log("🎉 Все таблицы успешно инициализированы!");
  } catch (error) {
    console.error("💥 Ошибка инициализации таблиц:", error);
    throw error;
  }
};
