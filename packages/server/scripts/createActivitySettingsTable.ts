import { pool } from "shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createActivitySettingsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS activity_settings (
      activity_id UUID PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
      session_goal_seconds INT NOT NULL DEFAULT 5400,
      notify_on_goal_reached BOOLEAN NOT NULL DEFAULT false,
      notify_on_long_pause BOOLEAN NOT NULL DEFAULT false,
      long_pause_threshold_seconds INT NOT NULL DEFAULT 1800,
      notify_on_long_activity BOOLEAN NOT NULL DEFAULT false,
      long_activity_threshold_seconds INT NOT NULL DEFAULT 1800,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT activity_settings_session_goal_positive
        CHECK (session_goal_seconds > 0),
      CONSTRAINT activity_settings_long_pause_threshold_positive
        CHECK (long_pause_threshold_seconds > 0),
      CONSTRAINT activity_settings_long_activity_threshold_positive
        CHECK (long_activity_threshold_seconds > 0)
    );
  `;

  try {
    await pool.query(query);
    console.log("✅ Таблица 'activity_settings' готова");
  } catch (error) {
    console.error("❌ Ошибка создания activity_settings:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createActivitySettingsTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createActivitySettingsTable.ts
