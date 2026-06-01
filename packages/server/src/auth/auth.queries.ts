import type { AuthUser } from "../shared/auth/auth.types.js";
import { pool, tokenService } from "../shared/index.js";

const db: { users: AuthUser[] } = {
  users: [
    {
      id: "1",
      login: "admin",
      password: await tokenService.generatePasswordHash("admin"),
      name: "Alexander",
      avatar: null,
      email: null,
    },
  ],
};

const findUserByLogin = async (login: string) => {
  const query = `
    SELECT
      id,
      login,
      password_hash,
      first_name AS name,
      email,
      avatar,
      is_active
    FROM users
    WHERE login = $1
  `;
  const { rows } = await pool.query(query, [login]);
  return rows[0] || null;
};

const createUser = async (data: {
  firstName: string;
  login: string;
  passwordHash: string;
}) => {
  const { firstName, login, passwordHash } = data;

  const query = `
    INSERT INTO users (first_name, login, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, first_name, login, created_at
  `;

  const { rows } = await pool.query(query, [firstName, login, passwordHash]);

  return rows[0] as {
    id: string;
    first_name: string;
    login: string;
    created_at: string;
  };
};

const findUserById = async (userId: AuthUser["id"]) => {
  const query = `
    SELECT
      id,
      login,
      first_name AS name,
      email,
      avatar,
      is_active AS "isActive"
    FROM users
    WHERE id = $1
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
};

export const authQueries = {
  findUserByLogin,
  createUser,
  findUserById,
};
