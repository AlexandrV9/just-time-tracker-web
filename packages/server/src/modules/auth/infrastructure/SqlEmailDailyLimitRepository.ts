import type { Pool } from "pg";
import { pool as defaultPool } from "shared/index.js";
import type { IEmailDailyLimitRepository } from "../domain/index.js";

const utcDayString = () => new Date().toISOString().slice(0, 10);

/**
 * SQL-доступ к таблице user_email_daily_sends.
 * Данный класс отвечает за дневной лимит отправки email конкретному пользователю
 */
export class SqlEmailDailyLimitRepository
  implements IEmailDailyLimitRepository
{
  private readonly pool: Pool;

  constructor(pool: Pool = defaultPool) {
    this.pool = pool;
  }

  /**
   * Создаёт таблицу user_email_daily_sends, если её ещё нет.
   * Требует, чтобы таблица users уже существовала (FK).
   */
  async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS user_email_daily_sends (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        day DATE NOT NULL,
        send_count INT NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, day),
        CONSTRAINT user_email_daily_sends_count_positive CHECK (send_count >= 0)
      )
    `);
  }

  async getSendCount(
    userId: string,
    day = utcDayString(),
  ): Promise<number> {
    const { rows } = await this.pool.query<{ send_count: number }>(
      `SELECT send_count
       FROM user_email_daily_sends
       WHERE user_id = $1 AND day = $2::date`,
      [userId, day],
    );

    return Number(rows[0]?.send_count ?? 0);
  }

  async tryConsumeSendSlot(
    userId: string,
    limit: number,
    day = utcDayString(),
  ): Promise<boolean> {
    const { rows } = await this.pool.query<{ send_count: number }>(
      `INSERT INTO user_email_daily_sends (user_id, day, send_count)
       VALUES ($1, $2::date, 1)
       ON CONFLICT (user_id, day) DO UPDATE
       SET send_count = user_email_daily_sends.send_count + 1
       WHERE user_email_daily_sends.send_count < $3
       RETURNING send_count`,
      [userId, day, limit],
    );

    return rows.length > 0;
  }

  async releaseSendSlot(
    userId: string,
    day = utcDayString(),
  ): Promise<void> {
    await this.pool.query(
      `UPDATE user_email_daily_sends
       SET send_count = GREATEST(send_count - 1, 0)
       WHERE user_id = $1 AND day = $2::date`,
      [userId, day],
    );
  }

  async incrementSendCount(
    userId: string,
    day = utcDayString(),
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO user_email_daily_sends (user_id, day, send_count)
       VALUES ($1, $2::date, 1)
       ON CONFLICT (user_id, day)
       DO UPDATE SET send_count = user_email_daily_sends.send_count + 1`,
      [userId, day],
    );
  }
}
