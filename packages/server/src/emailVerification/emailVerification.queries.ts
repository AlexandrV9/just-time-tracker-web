import { pool } from "../shared/index.js";

export type EmailVerificationRow = {
  id: string;
  userId: string;
  newEmail: string;
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
  new_email AS "newEmail",
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
    FROM email_verifications
    WHERE user_id = $1
  `;

  const { rows } = await pool.query(query, [userId]);
  return (rows[0] as EmailVerificationRow | undefined) ?? null;
};

const upsertVerification = async (input: {
  userId: string;
  newEmail: string;
  codeHash: string;
  expiresAt: Date;
  resendAvailableAt: Date;
}) => {
  const { userId, newEmail, codeHash, expiresAt, resendAvailableAt } = input;

  await pool.query(`DELETE FROM email_verifications WHERE user_id = $1`, [
    userId,
  ]);

  const query = `
    INSERT INTO email_verifications
      (user_id, new_email, code_hash, expires_at, resend_available_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${SELECT_COLUMNS}
  `;

  const { rows } = await pool.query(query, [
    userId,
    newEmail,
    codeHash,
    expiresAt.toISOString(),
    resendAvailableAt.toISOString(),
  ]);

  return rows[0] as EmailVerificationRow;
};

const refreshForResend = async (input: {
  userId: string;
  codeHash: string;
  expiresAt: Date;
  resendAvailableAt: Date;
}) => {
  const { userId, codeHash, expiresAt, resendAvailableAt } = input;

  const query = `
    UPDATE email_verifications
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

  return (rows[0] as EmailVerificationRow | undefined) ?? null;
};

const allowImmediateResend = async (userId: string) => {
  const query = `
    UPDATE email_verifications
    SET resend_available_at = NOW(), updated_at = NOW()
    WHERE user_id = $1
    RETURNING resend_available_at AS "resendAvailableAt"
  `;

  const { rows } = await pool.query(query, [userId]);
  return (rows[0] as { resendAvailableAt: string } | undefined) ?? null;
};

const incrementAttempts = async (userId: string) => {
  const query = `
    UPDATE email_verifications
    SET attempts_count = attempts_count + 1, updated_at = NOW()
    WHERE user_id = $1
    RETURNING attempts_count AS "attemptsCount"
  `;

  const { rows } = await pool.query(query, [userId]);
  return (rows[0] as { attemptsCount: number } | undefined)?.attemptsCount ?? null;
};

const resetAttempts = async (userId: string) => {
  await pool.query(
    `
    UPDATE email_verifications
    SET attempts_count = 0, updated_at = NOW()
    WHERE user_id = $1
    `,
    [userId],
  );
};

const deleteByUserId = async (userId: string) => {
  await pool.query(`DELETE FROM email_verifications WHERE user_id = $1`, [
    userId,
  ]);
};

const confirmUserEmail = async (input: { userId: string; email: string }) => {
  const { userId, email } = input;

  const query = `
    UPDATE users
    SET
      email = $1,
      email_verified_at = NOW(),
      updated_at = NOW()
    WHERE id = $2 AND is_active = true
    RETURNING
      id,
      first_name AS name,
      login,
      email,
      avatar
  `;

  const { rows } = await pool.query(query, [email, userId]);
  return rows[0] ?? null;
};

const isEmailTakenByAnotherUser = async (email: string, userId: string) => {
  const query = `
    SELECT id
    FROM users
    WHERE LOWER(email) = LOWER($1) AND id <> $2
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [email, userId]);
  return rows.length > 0;
};

export const emailVerificationQueries = {
  findByUserId,
  upsertVerification,
  refreshForResend,
  allowImmediateResend,
  incrementAttempts,
  resetAttempts,
  deleteByUserId,
  confirmUserEmail,
  isEmailTakenByAnotherUser,
};
