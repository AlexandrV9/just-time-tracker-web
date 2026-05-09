import { pool } from "src/shared/index.js";

export const createActivitySessionsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS activity_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

      started_at TIMESTAMPTZ NOT NULL,
      ended_at TIMESTAMPTZ,

      status VARCHAR(20) NOT NULL
        CHECK (status IN ('active', 'paused', 'finished')),

      active_duration_ms BIGINT NOT NULL DEFAULT 0,
      pause_duration_ms BIGINT NOT NULL DEFAULT 0,

      last_heartbeat_at TIMESTAMPTZ,
      current_segment_id UUID
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_activity_sessions_activity_id
      ON activity_sessions(activity_id);

    CREATE INDEX IF NOT EXISTS idx_activity_sessions_started_at
      ON activity_sessions(started_at);

    CREATE INDEX IF NOT EXISTS idx_activity_sessions_current_segment_id
      ON activity_sessions(current_segment_id);
  `;

  const addFk = `
    ALTER TABLE activities
      ADD COLUMN IF NOT EXISTS last_activity_session_id UUID;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'activities_last_activity_session_id_fkey'
      ) THEN
        ALTER TABLE activities
          ADD CONSTRAINT activities_last_activity_session_id_fkey
          FOREIGN KEY (last_activity_session_id)
          REFERENCES activity_sessions(id)
          ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);
    await pool.query(addFk);

    console.log(
      "✅ Таблица 'activity_sessions' готова (FK на activities.last_activity_session_id)",
    );
  } catch (error) {
    console.error("❌ Ошибка создания activity_sessions:", error);
    throw error;
  }
};

createActivitySessionsTable()
  .then(() => {
    console.log("✅ Скрипт завершен успешно");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Скрипт завершен с ошибкой:", error);
    process.exit(1);
  });

// npx tsx ./scripts/createActivitySessionsTable.ts
