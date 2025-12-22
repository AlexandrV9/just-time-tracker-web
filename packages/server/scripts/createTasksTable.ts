import { pool } from "src/shared/index.js";

/**
 * Скрипт для создания таблицы `tasks`, если она отсутствует.
 * Использует структуру, соответствующую типу TaskDTO.
 */
export const createTasksTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE,
      start_date TIMESTAMP WITH TIME ZONE,
      end_date TIMESTAMP WITH TIME ZONE,
      actual_start_date TIMESTAMP WITH TIME ZONE,
      actual_end_date TIMESTAMP WITH TIME ZONE,
      created_by_id TEXT NOT NULL,
      tags JSONB,
      is_deleting BOOLEAN DEFAULT FALSE
    );
  `;

  try {
    await pool.query(query);
    console.log("✅ Таблица 'tasks' существует (создана при необходимости).");
  } catch (err) {
    console.error("❌ Ошибка при создании таблицы 'tasks':", err);
    throw err;
  }
};

createTasksTable()
  .then(() => {
    console.log("✅ Скрипт завершен успешно");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Скрипт завершен с ошибкой:", error);
    process.exit(1);
  });

// npx tsx ./scripts/createTasksTable.ts
