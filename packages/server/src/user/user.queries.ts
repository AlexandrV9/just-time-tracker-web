import { pool } from "../shared/index.js";

type UpdateUserProfileInput = {
  userId: string;
  name: string;
  login: string;
};

const updateUserProfile = async ({
  userId,
  name,
  login,
}: UpdateUserProfileInput) => {
  const query = `
    UPDATE users
    SET first_name = $1, login = $2, updated_at = NOW()
    WHERE id = $3 AND is_active = true
    RETURNING
      id,
      first_name as name,
      login,
      email,
      avatar
  `;

  const { rows } = await pool.query(query, [name, login, userId]);
  return rows[0] ?? null;
};

export const userQueries = {
  updateUserProfile,
};
