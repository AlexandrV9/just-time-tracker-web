import { pool } from "src/shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createPushSubscriptionsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  const indexes = `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
      ON push_subscriptions(endpoint);

    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
      ON push_subscriptions(user_id);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'push_subscriptions' готова");
  } catch (error) {
    console.error("❌ Ошибка создания push_subscriptions:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createPushSubscriptionsTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createPushSubscriptionsTable.ts
