import { pool } from "../db/pool.js";

const utcDayString = () => new Date().toISOString().slice(0, 10);

const getSendCount = async (userId: string, day = utcDayString()) => {
  const { rows } = await pool.query<{ send_count: number }>(
    `SELECT send_count
     FROM user_email_daily_sends
     WHERE user_id = $1 AND day = $2::date`,
    [userId, day],
  );

  return Number(rows[0]?.send_count ?? 0);
};

/** Atomically reserves one send slot. Returns false when the daily cap is reached. */
const tryConsumeSendSlot = async (
  userId: string,
  limit: number,
  day = utcDayString(),
) => {
  const { rows } = await pool.query<{ send_count: number }>(
    `INSERT INTO user_email_daily_sends (user_id, day, send_count)
     VALUES ($1, $2::date, 1)
     ON CONFLICT (user_id, day) DO UPDATE
     SET send_count = user_email_daily_sends.send_count + 1
     WHERE user_email_daily_sends.send_count < $3
     RETURNING send_count`,
    [userId, day, limit],
  );

  return rows.length > 0;
};

const releaseSendSlot = async (userId: string, day = utcDayString()) => {
  await pool.query(
    `UPDATE user_email_daily_sends
     SET send_count = GREATEST(send_count - 1, 0)
     WHERE user_id = $1 AND day = $2::date`,
    [userId, day],
  );
};

const incrementSendCount = async (userId: string, day = utcDayString()) => {
  await pool.query(
    `INSERT INTO user_email_daily_sends (user_id, day, send_count)
     VALUES ($1, $2::date, 1)
     ON CONFLICT (user_id, day)
     DO UPDATE SET send_count = user_email_daily_sends.send_count + 1`,
    [userId, day],
  );
};

export const emailDailyLimitQueries = {
  getSendCount,
  tryConsumeSendSlot,
  releaseSendSlot,
  incrementSendCount,
};
