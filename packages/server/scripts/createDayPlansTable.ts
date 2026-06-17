import { pool } from "src/shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createDayPlansTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS day_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      created_by_id TEXT NOT NULL,
      date DATE NOT NULL,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT day_plans_created_by_date_unique UNIQUE (created_by_id, date)
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_day_plans_created_by_id
      ON day_plans(created_by_id);

    CREATE INDEX IF NOT EXISTS idx_day_plans_date
      ON day_plans(date);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'day_plans' готова");
  } catch (error) {
    console.error("❌ Ошибка создания day_plans:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createDayPlansTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createDayPlansTable.ts
