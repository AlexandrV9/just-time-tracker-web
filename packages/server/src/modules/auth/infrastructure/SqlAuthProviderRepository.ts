import type { Pool } from "pg";
import { getPool } from "shared/index.js";
import type {
  AuthProviderRecord,
  IAuthProviderRepository,
} from "../domain/index.js";

/**
 * SQL-доступ к таблице auth_providers.
 */
export class SqlAuthProviderRepository implements IAuthProviderRepository {
  private readonly pool: Pool;

  constructor(pool: Pool = getPool()) {
    this.pool = pool;
  }

  async findByUserId(userId: string): Promise<AuthProviderRecord[]> {
    const { rows } = await this.pool.query(
      `
        SELECT
          id,
          user_id AS "userId",
          provider,
          provider_user_id AS "providerUserId",
          created_at AS "createdAt"
        FROM auth_providers
        WHERE user_id = $1 AND disconnected_at IS NULL
      `,
      [userId],
    );

    return rows as AuthProviderRecord[];
  }

  async disconnect(userId: string, provider: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      `
        UPDATE auth_providers
        SET disconnected_at = NOW()
        WHERE user_id = $1 AND provider = $2 AND disconnected_at IS NULL
        RETURNING id
      `,
      [userId, provider],
    );

    return rows.length > 0;
  }
}
