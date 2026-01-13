import { pool } from "src/shared/index.js";

/**
 * Скрипт для создания таблицы `timeEntry`, если она отсутствует.
 */
export const createTimeEntriesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS time_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      title VARCHAR(255) NOT NULL,
      description TEXT,

      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ,

      created_by_id UUID NOT NULL,

      tags JSONB,
      show_in_calendar BOOLEAN NOT NULL DEFAULT false,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ,

      CONSTRAINT time_entries_date_check
        CHECK (
          start_date IS NULL
          OR end_date IS NULL
          OR end_date >= start_date
        )
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_time_entries_created_by
      ON time_entries(created_by_id);

    CREATE INDEX IF NOT EXISTS idx_time_entries_start_end
      ON time_entries(start_date, end_date);

    CREATE INDEX IF NOT EXISTS idx_time_entries_tags
      ON time_entries USING GIN (tags);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'time_entries' готова");
  } catch (error) {
    console.error("❌ Ошибка создания time_entries:", error);
    throw error;
  }
};

createTimeEntriesTable()
  .then(() => {
    console.log("✅ Скрипт завершен успешно");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Скрипт завершен с ошибкой:", error);
    process.exit(1);
  });

// npx tsx ./scripts/createTimeEntryTable.ts
