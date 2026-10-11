import { pool } from "shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createPasswordResetsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash VARCHAR(255) NOT NULL,
      attempts_count INT NOT NULL DEFAULT 0,
      resend_count INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      resend_available_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  const indexes = `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_password_resets_user_id
      ON password_resets(user_id);

    CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at
      ON password_resets(expires_at);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'password_resets' готова");
  } catch (error) {
    console.error("❌ Ошибка создания password_resets:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createPasswordResetsTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createPasswordResetsTable.ts
