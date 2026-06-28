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
      locale,
      push_notifications_enabled AS "pushNotificationsEnabled",
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
      locale,
      push_notifications_enabled AS "pushNotificationsEnabled",
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
      locale,
      push_notifications_enabled AS "pushNotificationsEnabled",
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
  const emailVerifiedAt = email ? new Date().toISOString() : null;

  const query = `
    INSERT INTO users (first_name, login, email, avatar, email_verified_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, first_name AS name, login, email, avatar
  `;
  const { rows } = await pool.query(query, [
    firstName,
    login,
    email,
    avatar,
    emailVerifiedAt,
  ]);
  return rows[0] as {
    id: string;
    name: string;
    login: string;
    email: string | null;
    avatar: string | null;
    locale: string;
    pushNotificationsEnabled: boolean;
  };
};

const findAuthProvider = async (provider: string, providerUserId: string) => {
  const query = `
    SELECT
      id,
      user_id AS "userId",
      provider,
      provider_user_id AS "providerUserId",
      disconnected_at AS "disconnectedAt"
    FROM auth_providers
    WHERE provider = $1 AND provider_user_id = $2
  `;
  const { rows } = await pool.query(query, [provider, providerUserId]);
  return (
    (rows[0] as
      | {
          id: string;
          userId: string;
          provider: string;
          providerUserId: string;
          disconnectedAt: string | null;
        }
      | undefined) ?? null
  );
};

const findAuthProvidersByUserId = async (userId: string) => {
  const query = `
    SELECT id, user_id AS "userId", provider, provider_user_id AS "providerUserId", created_at AS "createdAt"
    FROM auth_providers
    WHERE user_id = $1 AND disconnected_at IS NULL
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

const disconnectAuthProvider = async (userId: string, provider: string) => {
  const query = `
    UPDATE auth_providers
    SET disconnected_at = NOW()
    WHERE user_id = $1 AND provider = $2 AND disconnected_at IS NULL
    RETURNING id
  `;
  const { rows } = await pool.query(query, [userId, provider]);
  return (rows[0] as { id: string } | undefined) ?? null;
};

const reconnectAuthProvider = async (id: string) => {
  const query = `
    UPDATE auth_providers
    SET disconnected_at = NULL
    WHERE id = $1
    RETURNING id
  `;
  const { rows } = await pool.query(query, [id]);
  return (rows[0] as { id: string } | undefined) ?? null;
};

const reassignAuthProvider = async (id: string, userId: string) => {
  const query = `
    UPDATE auth_providers
    SET user_id = $2, disconnected_at = NULL
    WHERE id = $1
    RETURNING id
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return (rows[0] as { id: string } | undefined) ?? null;
};

const getUserPasswordHash = async (userId: string) => {
  const query = `SELECT password_hash FROM users WHERE id = $1`;
  const { rows } = await pool.query(query, [userId]);
  const row = rows[0] as { password_hash: string | null } | undefined;
  return row ? row.password_hash : null;
};

const setUserPassword = async (userId: string, passwordHash: string) => {
  const query = `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE id = $2 AND is_active = true
    RETURNING id
  `;
  const { rows } = await pool.query(query, [passwordHash, userId]);
  return (rows[0] as { id: string } | undefined) ?? null;
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
  disconnectAuthProvider,
  reconnectAuthProvider,
  reassignAuthProvider,
  getUserPasswordHash,
  setUserPassword,
};
