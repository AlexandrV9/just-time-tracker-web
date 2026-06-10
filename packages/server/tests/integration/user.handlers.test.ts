import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Hono } from "hono";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";
import { usersRouter } from "../../src/user/user.routes.js";
import { emailVerificationRouter } from "../../src/user/emailVerification.routes.js";
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
    return rows[0] as {
      id: string;
      login: string;
      first_name: string;
      email: string | null;
    };
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
    testRouter.route("/email-verification", emailVerificationRouter);
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  describe("PATCH /me", () => {
    it("updates name successfully", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Jane", login: "testuser" }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect((body.data as { name: string }).name).toBe("Jane");
    });

    it("updates login successfully", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", login: "newlogin" }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect((body.data as { login: string }).login).toBe("newlogin");
    });

    it("returns validation error when name is empty", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", login: "testuser" }),
      });
      const body = await json(res);

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Validation failed");
    });

    it("returns validation error when login is email-like", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", login: "john@example.com" }),
      });
      const body = await json(res);

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Validation failed");
    });

    it("returns not found when user does not exist", async () => {
      testRouter = new Hono<{ Variables: AuthVariables }>();
      testRouter.use("*", async (c, next) => {
        c.set("user", { id: "00000000-0000-0000-0000-000000000000" });
        await next();
      });
      testRouter.route("/", usersRouter);

      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ghost", login: "ghost" }),
      });
      const body = await json(res);

      expect(body.success).toBe(false);
      expect(body.message).toBe("User not found");
    });

    it("returns conflict error when login is already taken", async () => {
      await testDb.pool.query(
        `INSERT INTO users (login, password_hash, first_name, email)
         VALUES ($1, $2, $3, $4)`,
        ["otheruser", "hashed_password", "Other", null],
      );

      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", login: "otheruser" }),
      });
      const body = await json(res);

      expect(body.success).toBe(false);
      expect(body.message).toBe("User with this login already exists");
    });

    it("persists changes to the database", async () => {
      await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name", login: "updated_login" }),
      });

      const { rows } = await testDb.pool.query(
        "SELECT first_name, login FROM users WHERE id = $1",
        [testUserId],
      );
      expect(rows[0].first_name).toBe("Updated Name");
      expect(rows[0].login).toBe("updated_login");
    });

    it("returns updated user data in response", async () => {
      const res = await testRouter.request("/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "  Trimmed Name  ", login: "trimmed_login" }),
      });
      const body = await json(res);

      expect(body.success).toBe(true);
      const data = body.data as {
        name: string;
        login: string;
        email: string | null;
        id: unknown;
      };
      expect(data.name).toBe("Trimmed Name");
      expect(data.login).toBe("trimmed_login");
      expect(data.id).toBeDefined();
    });
  });

  describe("email-verification flow", () => {
    const start = (email: string) =>
      testRouter.request("/email-verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

    const confirm = (code: string) =>
      testRouter.request("/email-verification/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

    it("returns status none when there is no active request", async () => {
      const res = await testRouter.request("/email-verification/status");
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect((body.data as { status: string }).status).toBe("none");
    });

    it("starts verification and reports pending status", async () => {
      const startRes = await start("verified@example.com");
      const startBody = await json(startRes);

      expect(startRes.status).toBe(200);
      expect(startBody.success).toBe(true);
      const startData = startBody.data as {
        status: string;
        email: string;
        expiresAt: string;
        resendAvailableAt: string;
        devCode?: string;
      };
      expect(startData.status).toBe("pending");
      expect(startData.email).toBe("verified@example.com");
      expect(startData.devCode).toMatch(/^\d{6}$/);

      const statusRes = await testRouter.request("/email-verification/status");
      const statusBody = await json(statusRes);
      expect((statusBody.data as { status: string }).status).toBe("pending");
      expect((statusBody.data as { email: string }).email).toBe(
        "verified@example.com",
      );
    });

    it("confirms a valid code and updates the email", async () => {
      const startBody = await json(await start("verified@example.com"));
      const code = (startBody.data as { devCode: string }).devCode;

      const confirmRes = await confirm(code);
      const confirmBody = await json(confirmRes);

      expect(confirmRes.status).toBe(200);
      expect(confirmBody.success).toBe(true);
      const data = confirmBody.data as {
        status: string;
        user: { email: string };
      };
      expect(data.status).toBe("success");
      expect(data.user.email).toBe("verified@example.com");

      const { rows } = await testDb.pool.query(
        "SELECT email, email_verified_at FROM users WHERE id = $1",
        [testUserId],
      );
      expect(rows[0].email).toBe("verified@example.com");
      expect(rows[0].email_verified_at).not.toBeNull();
    });

    it("rejects an invalid code", async () => {
      await start("verified@example.com");

      const confirmBody = await json(await confirm("000000"));

      expect(confirmBody.success).toBe(false);
      expect(confirmBody.message).toBe("INVALID_CODE");
    });

    it("allows immediate resend after too many attempts", async () => {
      await start("verified@example.com");

      for (let i = 0; i < 5; i++) {
        const body = await json(await confirm("000000"));
        if (i < 4) {
          expect(body.message).toBe("INVALID_CODE");
        } else {
          expect(body.message).toBe("TOO_MANY_ATTEMPTS");
          expect(
            Date.parse(
              (body.data as { resendAvailableAt: string }).resendAvailableAt,
            ),
          ).toBeLessThanOrEqual(Date.now());
        }
      }

      const { rows } = await testDb.pool.query(
        "SELECT id FROM email_verifications WHERE user_id = $1",
        [testUserId],
      );
      expect(rows).toHaveLength(1);

      const resendBody = await json(
        await testRouter.request("/email-verification/resend", {
          method: "POST",
        }),
      );
      expect(resendBody.success).toBe(true);
      expect((resendBody.data as { status: string }).status).toBe("pending");
    });

    it("returns CODE_NOT_FOUND when confirming without an active request", async () => {
      const confirmBody = await json(await confirm("123456"));

      expect(confirmBody.success).toBe(false);
      expect(confirmBody.message).toBe("CODE_NOT_FOUND");
    });

    it("blocks resend before the cooldown elapses", async () => {
      await start("verified@example.com");

      const resendRes = await testRouter.request(
        "/email-verification/resend",
        { method: "POST" },
      );
      const resendBody = await json(resendRes);

      expect(resendBody.success).toBe(false);
      expect(resendBody.message).toBe("RESEND_TOO_EARLY");
      expect(
        (resendBody.data as { resendAvailableAt: string }).resendAvailableAt,
      ).toBeDefined();
    });

    it("rejects an email already taken by another user", async () => {
      await testDb.pool.query(
        `INSERT INTO users (login, password_hash, first_name, email)
         VALUES ($1, $2, $3, $4)`,
        ["otheruser", "hashed_password", "Other", "taken@example.com"],
      );

      const startBody = await json(await start("taken@example.com"));

      expect(startBody.success).toBe(false);
      expect(startBody.message).toBe("EMAIL_ALREADY_EXISTS");
    });
  });
});
