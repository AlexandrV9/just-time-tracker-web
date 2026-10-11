import type { Pool } from "pg";
import { pool as defaultPool } from "shared/index.js";
import type {
  IPasswordResetRepository,
  PasswordResetRecord,
} from "../domain/index.js";

interface PasswordResetRow {
  userId: string;
  codeHash: string;
  attemptsCount: number;
  expiresAt: string;
  resendAvailableAt: string;
  resendCount: number;
}

const SELECT_COLUMNS = `
  user_id AS "userId",
  code_hash AS "codeHash",
  resend_count AS "resendCount",
  attempts_count AS "attemptsCount",
  expires_at AS "expiresAt",
  resend_available_at AS "resendAvailableAt"
`;

export class SqlPasswordResetRepository implements IPasswordResetRepository {
  private readonly pool: Pool;

  constructor(pool: Pool = defaultPool) {
    this.pool = pool;
  }

  /**
   * Создаёт таблицу password_resets и индексы, если их ещё нет.
   * Вызывать при bootstrap / в тестах — не из конструктора (query async).
   * Требует, чтобы таблица users уже существовала (FK).
   */
  async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash VARCHAR(255) NOT NULL,
        attempts_count INT NOT NULL DEFAULT 0,
        resend_count INT NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        resend_available_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_password_resets_user_id
        ON password_resets(user_id);

      CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at
        ON password_resets(expires_at);
    `);
  }

  async findByUserId(userId: string): Promise<PasswordResetRecord | null> {
    const { rows } = await this.pool.query(
      `
        SELECT ${SELECT_COLUMNS}
        FROM password_resets
        WHERE user_id = $1
      `,
      [userId],
    );

    const row = rows[0] as PasswordResetRow | undefined;
    return row ? this.toEntity(row) : null;
  }

  async upsert(input: {
    userId: string;
    codeHash: string;
    expiresAt: Date;
    resendAvailableAt: Date;
  }): Promise<PasswordResetRecord> {
    const { rows } = await this.pool.query(
      `
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
      `,
      [
        input.userId,
        input.codeHash,
        input.expiresAt.toISOString(),
        input.resendAvailableAt.toISOString(),
      ],
    );

    return this.toEntity(rows[0] as PasswordResetRow);
  }

  async refreshForResend(input: {
    userId: string;
    codeHash: string;
    expiresAt: Date;
    resendAvailableAt: Date;
  }): Promise<PasswordResetRecord | null> {
    const { rows } = await this.pool.query(
      `
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
      `,
      [
        input.userId,
        input.codeHash,
        input.expiresAt.toISOString(),
        input.resendAvailableAt.toISOString(),
      ],
    );

    const row = rows[0] as PasswordResetRow | undefined;
    return row ? this.toEntity(row) : null;
  }

  async incrementAttempts(userId: string): Promise<number | null> {
    const { rows } = await this.pool.query(
      `
        UPDATE password_resets
        SET attempts_count = attempts_count + 1, updated_at = NOW()
        WHERE user_id = $1
        RETURNING attempts_count AS "attemptsCount"
      `,
      [userId],
    );

    const row = rows[0] as { attemptsCount: number } | undefined;
    return row ? row.attemptsCount : null;
  }

  async resetAttempts(userId: string): Promise<boolean> {
    const result = await this.pool.query(
      `
        UPDATE password_resets
        SET attempts_count = 0, updated_at = NOW()
        WHERE user_id = $1
      `,
      [userId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.pool.query(`DELETE FROM password_resets WHERE user_id = $1`, [
      userId,
    ]);
  }

  private toEntity = (row: PasswordResetRow): PasswordResetRecord => ({
    userId: String(row.userId),
    codeHash: row.codeHash,
    attemptsCount: row.attemptsCount,
    expiresAt: row.expiresAt,
    resendCount: row.resendCount,
    resendAvailableAt: row.resendAvailableAt,
  });
}
