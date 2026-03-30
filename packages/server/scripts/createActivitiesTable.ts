import { pool } from "src/shared/index.js";

export const createActivitiesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      title VARCHAR(255) NOT NULL,
      description TEXT,

      created_by_id TEXT NOT NULL,

      tags TEXT[] NOT NULL DEFAULT '{}',

      active_duration_ms BIGINT NOT NULL DEFAULT 0,
      pause_duration_ms BIGINT NOT NULL DEFAULT 0,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT activities_user_title_unique UNIQUE (created_by_id, title)
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_activities_created_by
      ON activities(created_by_id);

    CREATE INDEX IF NOT EXISTS idx_activities_created_at
      ON activities(created_at);

    CREATE INDEX IF NOT EXISTS idx_activities_tags
      ON activities USING GIN (tags);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'activities' готова");
  } catch (error) {
    console.error("❌ Ошибка создания activities:", error);
    throw error;
  }
};

createActivitiesTable()
  .then(() => {
    console.log("✅ Скрипт завершен успешно");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Скрипт завершен с ошибкой:", error);
    process.exit(1);
  });

// npx tsx ./scripts/createActivitiesTable.ts
