import { pool } from "../shared/index.js";

export type PasswordResetRow = {
  id: string;
  userId: string;
  codeHash: string;
  attemptsCount: number;
  resendCount: number;
  expiresAt: string;
  resendAvailableAt: string;
  createdAt: string;
  updatedAt: string;
};

const SELECT_COLUMNS = `
  id,
  user_id AS "userId",
  code_hash AS "codeHash",
  attempts_count AS "attemptsCount",
  resend_count AS "resendCount",
  expires_at AS "expiresAt",
  resend_available_at AS "resendAvailableAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const findByUserId = async (userId: string) => {
  const query = `
    SELECT ${SELECT_COLUMNS}
    FROM password_resets
    WHERE user_id = $1
  `;

  const { rows } = await pool.query(query, [userId]);
  return (rows[0] as PasswordResetRow | undefined) ?? null;
};

const upsert = async (input: {
  userId: string;
  codeHash: string;
  expiresAt: Date;
  resendAvailableAt: Date;
}) => {
  const { userId, codeHash, expiresAt, resendAvailableAt } = input;

  const query = `
    INSERT INTO password_resets
      (user_id, code_hash, expires_at, resend_available_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id) DO UPDATE
    SET
      code_hash = EXCLUDED.code_hash,
      attempts_count = 0,
      resend_count = 0,
      expires_at = EXCLUDED.expires_at,
      resend_available_at = EXCLUDED.resend_available_at,
      updated_at = NOW()
    RETURNING ${SELECT_COLUMNS}
  `;

  const { rows } = await pool.query(query, [
    userId,
    codeHash,
    expiresAt.toISOString(),
    resendAvailableAt.toISOString(),
  ]);

  return rows[0] as PasswordResetRow;
};

const refreshForResend = async (input: {
  userId: string;
  codeHash: string;
  expiresAt: Date;
  resendAvailableAt: Date;
}) => {
  const { userId, codeHash, expiresAt, resendAvailableAt } = input;

  const query = `
    UPDATE password_resets
    SET
      code_hash = $2,
      attempts_count = 0,
      resend_count = resend_count + 1,
      expires_at = $3,
      resend_available_at = $4,
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING ${SELECT_COLUMNS}
  `;

  const { rows } = await pool.query(query, [
    userId,
    codeHash,
    expiresAt.toISOString(),
    resendAvailableAt.toISOString(),
  ]);

  return (rows[0] as PasswordResetRow | undefined) ?? null;
};

const allowImmediateResend = async (userId: string) => {
  const query = `
    UPDATE password_resets
    SET resend_available_at = NOW(), updated_at = NOW()
    WHERE user_id = $1
    RETURNING resend_available_at AS "resendAvailableAt"
  `;

  const { rows } = await pool.query(query, [userId]);
  return (rows[0] as { resendAvailableAt: string } | undefined) ?? null;
};

const incrementAttempts = async (userId: string) => {
  const query = `
    UPDATE password_resets
    SET attempts_count = attempts_count + 1, updated_at = NOW()
    WHERE user_id = $1
    RETURNING attempts_count AS "attemptsCount"
  `;

  const { rows } = await pool.query(query, [userId]);
  return (
    (rows[0] as { attemptsCount: number } | undefined)?.attemptsCount ?? null
  );
};

const deleteByUserId = async (userId: string) => {
  await pool.query(`DELETE FROM password_resets WHERE user_id = $1`, [userId]);
};

export const passwordResetQueries = {
  findByUserId,
  upsert,
  refreshForResend,
  allowImmediateResend,
  incrementAttempts,
  deleteByUserId,
};
