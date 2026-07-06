import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { authRouter } from "../../src/auth/auth.routes.js";
import { passwordResetService } from "../../src/auth/passwordReset.service.js";
import {
  config,
  rateLimitKeys,
  rateLimitService,
  tokenService,
} from "../../src/shared/index.js";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";

const EMAIL = "ratelimit@example.com";
const LOGIN = "ratelimituser";
const PASSWORD = "ValidPass1";
const WRONG_PASSWORD = "WrongPass1";

const json = async (response: Response) => response.json();

describe("auth rate limiting", () => {
  let testDb: TestDatabase;
  let userId: string;
  let app: Hono;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  beforeEach(async () => {
    await resetUsersTables(testDb.pool);
    const passwordHash = await tokenService.generatePasswordHash(PASSWORD);
    const { rows } = await testDb.pool.query(
      `INSERT INTO users (login, first_name, email, password_hash, email_verified_at)
       VALUES ($1, 'Rate', $2, $3, NOW())
       RETURNING id`,
      [LOGIN, EMAIL, passwordHash],
    );
    userId = rows[0].id;

    app = new Hono();
    app.route("/auth", authRouter);
  });

  const signIn = (login = LOGIN, password = WRONG_PASSWORD, ip = "203.0.113.10") =>
    app.request("/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": ip,
      },
      body: JSON.stringify({ login, password }),
    });

  describe("login request limit", () => {
    it("enforces 5 requests per minute per IP", async () => {
      const key = rateLimitKeys.loginIp("203.0.113.50");
      const max = config.rateLimit.login.maxRequestsPerMinutePerIp;

      for (let i = 0; i < max; i++) {
        await rateLimitService.consumeRequest(key, 60);
      }

      const check = await rateLimitService.checkRequestLimit(key, max, 60);
      expect(check.blocked).toBe(true);
      if (check.blocked) {
        expect(Date.parse(check.retryAfter)).toBeGreaterThan(Date.now());
      }
    });
  });

  describe("login failure lockout", () => {
    it("locks out after repeated failed logins and escalates lockout duration", async () => {
      const failures = config.rateLimit.login.maxFailuresBeforeLockout;

      for (let i = 0; i < failures - 1; i++) {
        const res = await signIn(LOGIN, WRONG_PASSWORD, `203.0.113.${i + 1}`);
        expect(res.status).toBe(401);
      }

      const fifthRes = await signIn(LOGIN, WRONG_PASSWORD, "203.0.113.5");
      const lockedBody = await json(fifthRes);

      expect(fifthRes.status).toBe(429);
      expect(lockedBody.message).toBe("RATE_LIMITED");
      const firstLockMs =
        Date.parse(lockedBody.data.retryAfter) - Date.now();
      expect(firstLockMs).toBeGreaterThan(50_000);
      expect(firstLockMs).toBeLessThanOrEqual(60_000);

      vi.useFakeTimers();
      vi.setSystemTime(Date.parse(lockedBody.data.retryAfter) + 1);

      for (let i = 0; i < failures - 1; i++) {
        const res = await signIn(LOGIN, WRONG_PASSWORD, `203.0.114.${i + 1}`);
        expect(res.status).toBe(401);
      }

      const secondLockRes = await signIn(LOGIN, WRONG_PASSWORD, "203.0.114.5");
      const secondLockBody = await json(secondLockRes);
      const secondLockMs =
        Date.parse(secondLockBody.data.retryAfter) - Date.now();

      expect(secondLockRes.status).toBe(429);
      expect(secondLockMs).toBeGreaterThan(290_000);
      expect(secondLockMs).toBeLessThanOrEqual(300_000);

      vi.useRealTimers();
    });

    it("resets lockout tier after successful login", async () => {
      const failures = config.rateLimit.login.maxFailuresBeforeLockout;

      for (let i = 0; i < failures - 1; i++) {
        await signIn(LOGIN, WRONG_PASSWORD, "203.0.113.20");
      }

      const lockedRes = await signIn(LOGIN, WRONG_PASSWORD, "203.0.113.20");
      const lockedBody = await json(lockedRes);
      expect(lockedRes.status).toBe(429);

      vi.useFakeTimers();
      vi.setSystemTime(Date.parse(lockedBody.data.retryAfter) + 1);

      const successRes = await app.request("/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "203.0.113.20",
        },
        body: JSON.stringify({ login: LOGIN, password: PASSWORD }),
      });
      expect(successRes.status).toBe(200);

      for (let i = 0; i < failures - 1; i++) {
        const res = await signIn(LOGIN, WRONG_PASSWORD, "203.0.113.20");
        expect(res.status).toBe(401);
      }

      const lockedAgain = await signIn(LOGIN, WRONG_PASSWORD, "203.0.113.20");
      const lockedAgainBody = await json(lockedAgain);
      const lockMs = Date.parse(lockedAgainBody.data.retryAfter) - Date.now();

      expect(lockedAgain.status).toBe(429);
      expect(lockMs).toBeGreaterThan(50_000);
      expect(lockMs).toBeLessThanOrEqual(60_000);

      vi.useRealTimers();
    });
  });

  describe("password reset start limit", () => {
    it("returns RATE_LIMITED after 3 starts per hour for the same email", async () => {
      const max = config.rateLimit.passwordResetStart.maxPerHourPerEmail;

      for (let i = 0; i < max; i++) {
        await testDb.pool.query(`DELETE FROM password_resets WHERE user_id = $1`, [
          userId,
        ]);
        const result = await passwordResetService.start({ email: EMAIL });
        expect(result.success).toBe(true);
      }

      await testDb.pool.query(`DELETE FROM password_resets WHERE user_id = $1`, [
        userId,
      ]);
      const limited = await passwordResetService.start({ email: EMAIL });

      expect(limited.success).toBe(false);
      if (limited.success) return;
      expect(limited.message).toBe("RATE_LIMITED");
      expect(Date.parse(limited.data!.retryAfter)).toBeGreaterThan(Date.now());
    });
  });

  describe("password reset verify lockout", () => {
    const startAndGetCode = async () => {
      const result = await passwordResetService.start({ email: EMAIL });
      expect(result.success).toBe(true);
      if (!result.success) throw new Error("start failed");
      return result.data.devCode as string;
    };

    it("returns TOO_MANY_ATTEMPTS with a future retryAfter after 5 invalid codes", async () => {
      await startAndGetCode();

      let lastMessage = "";
      let retryAfter: string | undefined;

      for (let i = 0; i < 5; i++) {
        const result = await passwordResetService.verify({
          email: EMAIL,
          code: "000000",
        });
        if (result.success) continue;
        lastMessage = result.message;
        retryAfter = (result.data as { retryAfter?: string } | undefined)?.retryAfter;
      }

      expect(lastMessage).toBe("TOO_MANY_ATTEMPTS");
      expect(retryAfter).toBeDefined();
      expect(
        Date.parse(retryAfter as string) - Date.now(),
      ).toBeGreaterThan(50_000);
    });

    it("blocks resend while verify lockout is active", async () => {
      await startAndGetCode();

      for (let i = 0; i < 5; i++) {
        await passwordResetService.verify({ email: EMAIL, code: "000000" });
      }

      const resend = await passwordResetService.resend({ email: EMAIL });
      expect(resend.success).toBe(false);
      if (resend.success) return;
      expect(resend.message).toBe("TOO_MANY_ATTEMPTS");
      expect(
        Date.parse(
          (resend.data as { retryAfter: string }).retryAfter,
        ),
      ).toBeGreaterThan(Date.now());
    });
  });

  describe("rateLimitService", () => {
    it("recordSuccess clears lockout state", async () => {
      const key = rateLimitKeys.loginAccount("test-account");
      for (let i = 0; i < config.rateLimit.login.maxFailuresBeforeLockout; i++) {
        await rateLimitService.recordFailure([key]);
      }
      const locked = await rateLimitService.checkLocked([key]);
      expect(locked.blocked).toBe(true);

      await rateLimitService.recordSuccess([key]);
      const cleared = await rateLimitService.checkLocked([key]);
      expect(cleared.blocked).toBe(false);
    });
  });
});
