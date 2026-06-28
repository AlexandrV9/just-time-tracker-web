import type { UserLocaleDTO } from "@time-tracker/shared";
import { pool } from "../shared/index.js";

export type PublicUserRow = {
  id: string;
  name: string;
  login: string;
  email: string | null;
  avatar: string | null;
  locale: UserLocaleDTO;
  pushNotificationsEnabled: boolean;
};

export type UserNotificationPreferences = {
  locale: UserLocaleDTO;
  pushNotificationsEnabled: boolean;
};

const USER_PUBLIC_COLUMNS = `
  id,
  first_name AS name,
  login,
  email,
  avatar,
  locale,
  push_notifications_enabled AS "pushNotificationsEnabled"
`;

const mapPublicUserRow = (row: PublicUserRow): PublicUserRow => ({
  id: String(row.id),
  name: row.name,
  login: row.login,
  email: row.email ?? null,
  avatar: row.avatar ?? null,
  locale: row.locale ?? "en",
  pushNotificationsEnabled: row.pushNotificationsEnabled ?? true,
});

type UpdateUserProfileInput = {
  userId: string;
  name: string;
  login: string;
};

const updateUserProfile = async ({
  userId,
  name,
  login,
}: UpdateUserProfileInput): Promise<PublicUserRow | null> => {
  const query = `
    UPDATE users
    SET first_name = $1, login = $2, updated_at = NOW()
    WHERE id = $3 AND is_active = true
    RETURNING ${USER_PUBLIC_COLUMNS}
  `;

  const { rows } = await pool.query(query, [name, login, userId]);
  return rows[0] ? mapPublicUserRow(rows[0] as PublicUserRow) : null;
};

const findPublicUserById = async (
  userId: string,
): Promise<PublicUserRow | null> => {
  const query = `
    SELECT ${USER_PUBLIC_COLUMNS}
    FROM users
    WHERE id = $1 AND is_active = true
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] ? mapPublicUserRow(rows[0] as PublicUserRow) : null;
};

const getNotificationPreferences = async (
  userId: string,
): Promise<UserNotificationPreferences | null> => {
  const query = `
    SELECT locale, push_notifications_enabled AS "pushNotificationsEnabled"
    FROM users
    WHERE id = $1 AND is_active = true
  `;

  const { rows } = await pool.query(query, [userId]);
  const row = rows[0] as UserNotificationPreferences | undefined;
  return row ?? null;
};

const updateUserLocale = async (
  userId: string,
  locale: UserLocaleDTO,
): Promise<PublicUserRow | null> => {
  const query = `
    UPDATE users
    SET locale = $1, updated_at = NOW()
    WHERE id = $2 AND is_active = true
    RETURNING ${USER_PUBLIC_COLUMNS}
  `;

  const { rows } = await pool.query(query, [locale, userId]);
  return rows[0] ? mapPublicUserRow(rows[0] as PublicUserRow) : null;
};

const updatePushNotificationsEnabled = async (
  userId: string,
  enabled: boolean,
): Promise<PublicUserRow | null> => {
  const query = `
    UPDATE users
    SET push_notifications_enabled = $1, updated_at = NOW()
    WHERE id = $2 AND is_active = true
    RETURNING ${USER_PUBLIC_COLUMNS}
  `;

  const { rows } = await pool.query(query, [enabled, userId]);
  return rows[0] ? mapPublicUserRow(rows[0] as PublicUserRow) : null;
};

export const userQueries = {
  updateUserProfile,
  findPublicUserById,
  getNotificationPreferences,
  updateUserLocale,
  updatePushNotificationsEnabled,
};
