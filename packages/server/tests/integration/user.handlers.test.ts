import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Hono } from "hono";
import type { TestDatabase } from "../setup/test-db.js";
import {
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";
import { usersRouter } from "../../src/user/user.routes.js";
import type { AuthVariables } from "../../src/shared/auth/auth.variables.js";

type JsonBody = Record<string, unknown>;

const json = async (res: Response): Promise<JsonBody> =>
  (await res.json()) as JsonBody;

describe("usersRouter", () => {
  let testDb: TestDatabase;
  let testUserId: string;
  let testRouter: Hono<{ Variables: AuthVariables }>;

  const seedUser = async (overrides?: {
    login?: string;
    firstName?: string;
    email?: string;
  }) => {
    const login = overrides?.login ?? "testuser";
    const firstName = overrides?.firstName ?? "John";
    const email = overrides?.email ?? null;

    const { rows } = await testDb.pool.query(
      `INSERT INTO users (login, password_hash, first_name, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, login, first_name, email`,
      [login, "hashed_password", firstName, email],
    );
    return rows[0] as { id: number; login: string; first_name: string; email: string | null };
  };

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    await resetUsersTables(testDb.pool);
    const user = await seedUser();
    testUserId = String(user.id);

    testRouter = new Hono<{ Variables: AuthVariables }>();
    testRouter.use("*", async (c, next) => {
      c.set("user", { id: testUserId });
      await next();
    });
    testRouter.route("/", usersRouter);
  });

  afterAll(async () => {
    await testDb?.stop();
  });

  describe("PATCH /me", () => {
    it("updates name successfully", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Jane", email: "" }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect((body.data as { name: string }).name).toBe("Jane");
    });

    it("updates email successfully", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "john@example.com" }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect((body.data as { email: string }).email).toBe("john@example.com");
    });

    it("clears email when empty string is sent", async () => {
      await testDb.pool.query(
        "UPDATE users SET email = $1 WHERE id = $2",
        ["existing@example.com", testUserId],
      );

      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "" }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect((body.data as { email: string | null }).email).toBeNull();
    });

    it("returns validation error when name is empty", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", email: "" }),
      });
      const body = await json(res);

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Validation failed");
    });

    it("returns validation error for invalid email format", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "not-an-email" }),
      });
      const body = await json(res);

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Validation failed");
    });

    it("returns not found when user does not exist", async () => {
      testRouter = new Hono<{ Variables: AuthVariables }>();
      testRouter.use("*", async (c, next) => {
        c.set("user", { id: "99999" });
        await next();
      });
      testRouter.route("/", usersRouter);

      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ghost", email: "" }),
      });
      const body = await json(res);

      expect(body.success).toBe(false);
      expect(body.message).toBe("User not found");
    });

    it("returns conflict error when email is already taken", async () => {
      await testDb.pool.query(
        `INSERT INTO users (login, password_hash, first_name, email)
         VALUES ($1, $2, $3, $4)`,
        ["otheruser", "hashed_password", "Other", "taken@example.com"],
      );

      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "taken@example.com" }),
      });
      const body = await json(res);

      expect(body.success).toBe(false);
      expect(body.message).toBe("User with this email already exists");
    });

    it("persists changes to the database", async () => {
      await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name", email: "updated@example.com" }),
      });

      const { rows } = await testDb.pool.query(
        "SELECT first_name, email FROM users WHERE id = $1",
        [testUserId],
      );
      expect(rows[0].first_name).toBe("Updated Name");
      expect(rows[0].email).toBe("updated@example.com");
    });

    it("returns updated user data in response", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "  Trimmed Name  ", email: "test@example.com" }),
      });
      const body = await json(res);

      expect(body.success).toBe(true);
      const data = body.data as { name: string; login: string; email: string; id: unknown };
      expect(data.name).toBe("Trimmed Name");
      expect(data.login).toBe("testuser");
      expect(data.email).toBe("test@example.com");
      expect(data.id).toBeDefined();
    });
  });
});
