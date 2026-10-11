import { pool } from "shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createDayPlanItemsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS day_plan_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      day_plan_id UUID NOT NULL
        REFERENCES day_plans(id) ON DELETE CASCADE,
      activity_id UUID NOT NULL
        REFERENCES activities(id) ON DELETE CASCADE,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT day_plan_items_plan_activity_unique UNIQUE (day_plan_id, activity_id)
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_day_plan_items_day_plan_id
      ON day_plan_items(day_plan_id);

    CREATE INDEX IF NOT EXISTS idx_day_plan_items_activity_id
      ON day_plan_items(activity_id);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'day_plan_items' готова");
  } catch (error) {
    console.error("❌ Ошибка создания day_plan_items:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createDayPlanItemsTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createDayPlanItemsTable.ts
