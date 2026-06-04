import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";
import {
  loginWithYandex,
  linkYandexToUser,
  type YandexProfile,
} from "../../src/auth/yandex.service.js";

const makeProfile = (overrides?: Partial<YandexProfile>): YandexProfile => ({
  id: "yandex-123",
  default_email: "user@yandex.ru",
  first_name: "Alexey",
  login: "alexey",
  default_avatar_id: null,
  ...overrides,
});

describe("yandex OAuth service", () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  describe("loginWithYandex", () => {
    beforeEach(async () => {
      await resetUsersTables(testDb.pool);
    });

    it("creates a new user and auth_provider on first login", async () => {
      const result = await loginWithYandex(makeProfile());

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.user.login).toBe("yandex_yandex-123");

      const { rows: providers } = await testDb.pool.query(
        `SELECT * FROM auth_providers WHERE provider = 'yandex' AND provider_user_id = 'yandex-123'`,
      );
      expect(providers).toHaveLength(1);
      expect(providers[0].user_id).toBe(result.data.user.id);

      const { rows: users } = await testDb.pool.query(
        `SELECT password_hash FROM users WHERE id = $1`,
        [result.data.user.id],
      );
      expect(users[0].password_hash).toBeNull();
    });

    it("returns tokens for existing provider (subsequent login)", async () => {
      const first = await loginWithYandex(makeProfile());
      expect(first.success).toBe(true);

      const second = await loginWithYandex(makeProfile());
      expect(second.success).toBe(true);

      if (!first.success || !second.success) return;
      expect(second.data.user.id).toBe(first.data.user.id);

      const { rows: providers } = await testDb.pool.query(
        `SELECT COUNT(*) FROM auth_providers WHERE provider = 'yandex' AND provider_user_id = 'yandex-123'`,
      );
      expect(Number(providers[0].count)).toBe(1);
    });

    it("returns EMAIL_ALREADY_EXISTS when email is taken by another account", async () => {
      await testDb.pool.query(
        `INSERT INTO users (login, first_name, email, password_hash)
       VALUES ('existing', 'Existing', 'user@yandex.ru', 'hash')`,
      );

      const result = await loginWithYandex(makeProfile());

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("EMAIL_ALREADY_EXISTS");

      const { rows: providers } = await testDb.pool.query(
        `SELECT COUNT(*) FROM auth_providers WHERE provider = 'yandex'`,
      );
      expect(Number(providers[0].count)).toBe(0);
    });

    it("creates user without email when profile has no email", async () => {
      const result = await loginWithYandex(
        makeProfile({ default_email: null }),
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.user.email).toBeNull();
    });
  });

  describe("linkYandexToUser", () => {
    let userId: string;

    beforeEach(async () => {
      await resetUsersTables(testDb.pool);
      const { rows } = await testDb.pool.query(
        `INSERT INTO users (login, first_name, password_hash)
       VALUES ('testuser', 'Test', 'hash')
       RETURNING id`,
      );
      userId = rows[0].id;
    });

    it("links Yandex to user successfully", async () => {
      const result = await linkYandexToUser(userId, makeProfile());

      expect(result.success).toBe(true);

      const { rows } = await testDb.pool.query(
        `SELECT * FROM auth_providers WHERE user_id = $1 AND provider = 'yandex'`,
        [userId],
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].provider_user_id).toBe("yandex-123");
    });

    it("returns YANDEX_ALREADY_LINKED when Yandex ID is linked to another user", async () => {
      const { rows } = await testDb.pool.query(
        `INSERT INTO users (login, first_name, password_hash)
       VALUES ('another', 'Another', 'hash')
       RETURNING id`,
      );
      const anotherUserId = rows[0].id;

      await testDb.pool.query(
        `INSERT INTO auth_providers (user_id, provider, provider_user_id)
       VALUES ($1, 'yandex', 'yandex-123')`,
        [anotherUserId],
      );

      const result = await linkYandexToUser(userId, makeProfile());

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("YANDEX_ALREADY_LINKED");
    });

    it("returns PROVIDER_ALREADY_CONNECTED when user already has Yandex linked", async () => {
      await testDb.pool.query(
        `INSERT INTO auth_providers (user_id, provider, provider_user_id)
       VALUES ($1, 'yandex', 'yandex-123')`,
        [userId],
      );

      const result = await linkYandexToUser(userId, makeProfile());

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("PROVIDER_ALREADY_CONNECTED");
    });
  });
});
