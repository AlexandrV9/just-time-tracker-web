import { pool } from "shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createActivitySessionSegmentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS activity_session_segments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      session_id UUID NOT NULL REFERENCES activity_sessions(id) ON DELETE CASCADE,

      segment_type VARCHAR(10) NOT NULL
        CHECK (segment_type IN ('active', 'pause')),

      started_at TIMESTAMPTZ NOT NULL,
      ended_at TIMESTAMPTZ
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_activity_session_segments_session_id
      ON activity_session_segments(session_id);

    CREATE INDEX IF NOT EXISTS idx_activity_session_segments_started_at
      ON activity_session_segments(started_at);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'activity_session_segments' готова");
  } catch (error) {
    console.error("❌ Ошибка создания activity_session_segments:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createActivitySessionSegmentsTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createActivitySessionSegmentsTable.ts
