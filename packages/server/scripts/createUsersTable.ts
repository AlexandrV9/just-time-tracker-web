import { pool } from "src/shared/index.js";

export const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      first_name VARCHAR(255) NOT NULL,
      login VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,

      email VARCHAR(255),
      avatar TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  try {
    await pool.query(query);
    await pool.query(indexes);

    console.log("✅ Таблица 'users' готова");
  } catch (error) {
    console.error("❌ Ошибка создания users:", error);
    throw error;
  }
};

createUsersTable()
  .then(() => {
    console.log("✅ Скрипт завершен успешно");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Скрипт завершен с ошибкой:", error);
    process.exit(1);
  });

// npx tsx ./scripts/createUsersTable.ts
