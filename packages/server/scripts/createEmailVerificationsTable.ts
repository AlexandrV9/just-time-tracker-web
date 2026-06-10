import { pool } from "src/shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createEmailVerificationsTable = async () => {
  const query = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

    UPDATE users
    SET email_verified_at = created_at
    WHERE email IS NOT NULL AND email_verified_at IS NULL;

    DROP TABLE IF EXISTS email_verification_codes;

    CREATE TABLE IF NOT EXISTS email_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      new_email VARCHAR(255) NOT NULL,
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
    CREATE UNIQUE INDEX IF NOT EXISTS idx_email_verifications_user_id
      ON email_verifications(user_id);

    CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at
      ON email_verifications(expires_at);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'email_verifications' готова");
  } catch (error) {
    console.error("❌ Ошибка создания email_verifications:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createEmailVerificationsTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createEmailVerificationsTable.ts
