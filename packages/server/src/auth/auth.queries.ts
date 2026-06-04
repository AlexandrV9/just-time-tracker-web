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

const findUserByEmail = async (email: string) => {
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
    WHERE email = $1
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0] || null;
};

const createOAuthUser = async (data: {
  firstName: string;
  login: string;
  email: string | null;
  avatar: string | null;
}) => {
  const { firstName, login, email, avatar } = data;
  const query = `
    INSERT INTO users (first_name, login, email, avatar)
    VALUES ($1, $2, $3, $4)
    RETURNING id, first_name AS name, login, email, avatar
  `;
  const { rows } = await pool.query(query, [firstName, login, email, avatar]);
  return rows[0] as {
    id: string;
    name: string;
    login: string;
    email: string | null;
    avatar: string | null;
  };
};

const findAuthProvider = async (provider: string, providerUserId: string) => {
  const query = `
    SELECT id, user_id AS "userId", provider, provider_user_id AS "providerUserId"
    FROM auth_providers
    WHERE provider = $1 AND provider_user_id = $2
  `;
  const { rows } = await pool.query(query, [provider, providerUserId]);
  return rows[0] || null;
};

const findAuthProvidersByUserId = async (userId: string) => {
  const query = `
    SELECT id, user_id AS "userId", provider, provider_user_id AS "providerUserId", created_at AS "createdAt"
    FROM auth_providers
    WHERE user_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows as Array<{
    id: string;
    userId: string;
    provider: string;
    providerUserId: string;
    createdAt: string;
  }>;
};

const createAuthProvider = async (data: {
  userId: string;
  provider: string;
  providerUserId: string;
}) => {
  const { userId, provider, providerUserId } = data;
  const query = `
    INSERT INTO auth_providers (user_id, provider, provider_user_id)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const { rows } = await pool.query(query, [userId, provider, providerUserId]);
  return rows[0] as { id: string };
};

export const authQueries = {
  findUserByLogin,
  createUser,
  findUserById,
  findUserByEmail,
  createOAuthUser,
  findAuthProvider,
  findAuthProvidersByUserId,
  createAuthProvider,
};
