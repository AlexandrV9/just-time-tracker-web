import { pool } from "src/shared/index.js";
import { isMainModule } from "./isMainModule.js";

export const createAuthProvidersTable = async () => {
  const query = `
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

    CREATE TABLE IF NOT EXISTS auth_providers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider VARCHAR(50) NOT NULL,
      provider_user_id VARCHAR(255) NOT NULL,
      disconnected_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (provider, provider_user_id)
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id ON auth_providers(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_providers_active_user_provider
      ON auth_providers (user_id, provider)
      WHERE disconnected_at IS NULL;
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'auth_providers' готова");
  } catch (error) {
    console.error("❌ Ошибка создания auth_providers:", error);
    throw error;
  }
};

if (isMainModule(import.meta.url)) {
  createAuthProvidersTable()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createAuthProvidersTable.ts
