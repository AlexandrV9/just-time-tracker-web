import type { Pool } from "pg";
import type { UserLocaleDTO } from "@time-tracker/shared";
import { pool as defaultPool } from "shared/index.js";
import type {
  CreateUserDataDTO,
  UpdateUserDataDTO,
  UserAuthDTO,
  UserDTO,
} from "../domain/types.js";
import type { IUserRepository } from "../domain/index.js";

/**
 * Строка таблицы users в Postgres.
 * Используется для маппинга между snake_case колонками и доменной сущностью.
 */
interface UserRow {
  id: string;
  name: string;
  login: string;
  email: string | null;
  avatar: string | null;
  locale: UserLocaleDTO;
  pushNotificationsEnabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  passwordHash?: string | null;
}

const USER_PUBLIC_COLUMNS = `
  id,
  first_name AS name,
  login,
  email,
  avatar,
  locale,
  push_notifications_enabled AS "pushNotificationsEnabled",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const USER_AUTH_COLUMNS = `
  ${USER_PUBLIC_COLUMNS},
  password_hash AS "passwordHash"
`;

/**
 * Реализация репозитория пользователей на Postgres (pg.Pool).
 */
export class SqlUserRepository implements IUserRepository {
  private readonly pool: Pool;

  constructor(pool: Pool = defaultPool) {
    this.pool = pool;
  }

  /**
   * Создаёт таблицу users и индексы, если их ещё нет.
   * Вызывать при bootstrap / в тестах — не из конструктора (query async).
   */
  async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        first_name VARCHAR(255) NOT NULL,
        login VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),

        email VARCHAR(255) UNIQUE,
        email_verified_at TIMESTAMPTZ,
        avatar TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        locale VARCHAR(5) NOT NULL DEFAULT 'en',
        push_notifications_enabled BOOLEAN NOT NULL DEFAULT true,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
  }

  async findById(id: string): Promise<UserDTO | null> {
    const { rows } = await this.pool.query(
      `
        SELECT ${USER_PUBLIC_COLUMNS}
        FROM users
        WHERE id = $1 AND is_active = true
      `,
      [id],
    );

    const row = rows[0] as UserRow | undefined;
    return row ? this.toEntity(row) : null;
  }

  async findByLogin(login: string): Promise<UserDTO | null> {
    const { rows } = await this.pool.query(
      `
        SELECT ${USER_PUBLIC_COLUMNS}
        FROM users
        WHERE login = $1 AND is_active = true
      `,
      [login],
    );

    const row = rows[0] as UserRow | undefined;
    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const { rows } = await this.pool.query(
      `
        SELECT ${USER_PUBLIC_COLUMNS}
        FROM users
        WHERE email = $1 AND is_active = true
      `,
      [email],
    );

    const row = rows[0] as UserRow | undefined;
    return row ? this.toEntity(row) : null;
  }

  async findAuthByLogin(login: string): Promise<UserAuthDTO | null> {
    const { rows } = await this.pool.query(
      `
        SELECT ${USER_AUTH_COLUMNS}
        FROM users
        WHERE login = $1 AND is_active = true
      `,
      [login],
    );

    const row = rows[0] as UserRow | undefined;
    if (!row) {
      return null;
    }

    return {
      ...this.toEntity(row),
      passwordHash: row.passwordHash ?? null,
    };
  }

  async save(user: CreateUserDataDTO): Promise<UserDTO> {
    const { rows } = await this.pool.query(
      `
        INSERT INTO users (first_name, login, password_hash)
        VALUES ($1, $2, $3)
        RETURNING ${USER_PUBLIC_COLUMNS}
      `,
      [user.firstName, user.login, user.passwordHash],
    );

    return this.toEntity(rows[0] as UserRow);
  }

  async update(user: UpdateUserDataDTO): Promise<UserDTO | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (user.login !== undefined) {
      sets.push(`login = $${i++}`);
      values.push(user.login);
    }
    if (user.name !== undefined) {
      sets.push(`first_name = $${i++}`);
      values.push(user.name);
    }
    if (user.locale !== undefined) {
      sets.push(`locale = $${i++}`);
      values.push(user.locale);
    }
    if (user.pushNotificationsEnabled !== undefined) {
      sets.push(`push_notifications_enabled = $${i++}`);
      values.push(user.pushNotificationsEnabled);
    }

    if (sets.length === 0) {
      return null;
    }

    sets.push(`updated_at = NOW()`);
    values.push(user.id);

    const { rows } = await this.pool.query(
      `
        UPDATE users
        SET ${sets.join(", ")}
        WHERE id = $${i} AND is_active = true
        RETURNING ${USER_PUBLIC_COLUMNS}
      `,
      values,
    );

    const row = rows[0] as UserRow | undefined;
    return row ? this.toEntity(row) : null;
  }

  async getPasswordHash(userId: string): Promise<string | null> {
    const { rows } = await this.pool.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [userId],
    );
    const row = rows[0] as { password_hash: string | null } | undefined;
    return row ? row.password_hash : null;
  }

  async setPasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<boolean> {
    const { rows } = await this.pool.query(
      `
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2 AND is_active = true
        RETURNING id
      `,
      [passwordHash, userId],
    );
    return Boolean(rows[0]);
  }

  private toEntity(row: UserRow): UserDTO {
    return {
      id: String(row.id),
      login: row.login,
      name: row.name,
      avatar: row.avatar ?? null,
      email: row.email ?? null,
      locale: row.locale ?? "en",
      pushNotificationsEnabled: row.pushNotificationsEnabled ?? true,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt),
      updatedAt: row.updatedAt
        ? row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : String(row.updatedAt)
        : null,
    };
  }
}
