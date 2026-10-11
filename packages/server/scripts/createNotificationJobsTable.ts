import { pool } from "shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createNotificationJobsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS notification_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      payload JSONB,
      send_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT notification_jobs_status_check
        CHECK (status IN ('pending', 'sent', 'failed', 'canceled'))
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_send_at
      ON notification_jobs(status, send_at);

    CREATE INDEX IF NOT EXISTS idx_notification_jobs_user_id
      ON notification_jobs(user_id);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'notification_jobs' готова");
  } catch (error) {
    console.error("❌ Ошибка создания notification_jobs:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createNotificationJobsTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createNotificationJobsTable.ts
