import bcrypt from "bcrypt";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { tokenService } from "../../src/shared/index.js";
import { passwordResetService } from "../../src/auth/passwordReset.service.js";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";

const EMAIL = "reset@example.com";
const OLD_PASSWORD = "OldPass1";
const NEW_PASSWORD = "NewPass1";

describe("password reset service", () => {
  let testDb: TestDatabase;
  let userId: string;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  beforeEach(async () => {
    await resetUsersTables(testDb.pool);
    const passwordHash = await tokenService.generatePasswordHash(OLD_PASSWORD);
    const { rows } = await testDb.pool.query(
      `INSERT INTO users (login, first_name, email, password_hash, email_verified_at)
       VALUES ('resetuser', 'Reset', $1, $2, NOW())
       RETURNING id`,
      [EMAIL, passwordHash],
    );
    userId = rows[0].id;
  });

  const startAndGetCode = async () => {
    const result = await passwordResetService.start({ email: EMAIL });
    expect(result.success).toBe(true);
    if (!result.success) throw new Error("start failed");
    expect(result.data.status).toBe("pending");
    expect(result.data.devCode).toMatch(/^\d{6}$/);
    return result.data.devCode as string;
  };

  describe("getStatus", () => {
    it("returns none when there is no active reset request", async () => {
      const result = await passwordResetService.getStatus({ email: EMAIL });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.status).toBe("none");
    });

    it("returns pending state with server timestamps after start", async () => {
      const started = await passwordResetService.start({ email: EMAIL });
      expect(started.success).toBe(true);
      if (!started.success) return;

      const result = await passwordResetService.getStatus({ email: EMAIL });
      expect(result.success).toBe(true);
      if (!result.success || result.data.status !== "pending") return;

      expect(result.data.email).toBe(EMAIL);
      expect(result.data.expiresAt).toBe(started.data.expiresAt);
      expect(result.data.resendAvailableAt).toBe(started.data.resendAvailableAt);
    });
  });

  describe("start", () => {
    it("creates a reset request and returns a dev code for an existing email", async () => {
      await startAndGetCode();

      const { rows } = await testDb.pool.query(
        `SELECT user_id FROM password_resets WHERE user_id = $1`,
        [userId],
      );
      expect(rows).toHaveLength(1);
    });

    it("returns USER_NOT_FOUND for an unknown email", async () => {
      const result = await passwordResetService.start({
        email: "ghost@example.com",
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("USER_NOT_FOUND");

      const { rows } = await testDb.pool.query(
        `SELECT COUNT(*) FROM password_resets`,
      );
      expect(Number(rows[0].count)).toBe(0);
    });
  });

  describe("verify", () => {
    it("rejects an invalid code", async () => {
      await startAndGetCode();

      const result = await passwordResetService.verify({
        email: EMAIL,
        code: "000000",
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("INVALID_CODE");
    });

    it("rejects a code for an unknown email without leaking", async () => {
      const result = await passwordResetService.verify({
        email: "ghost@example.com",
        code: "123456",
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("INVALID_CODE");
    });

    it("returns a reset token for a valid code", async () => {
      const code = await startAndGetCode();

      const result = await passwordResetService.verify({ email: EMAIL, code });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.status).toBe("verified");
      if (result.data.status !== "verified") return;
      expect(typeof result.data.resetToken).toBe("string");
      expect(result.data.resetToken.length).toBeGreaterThan(0);
    });

    it("blocks after too many attempts and applies lockout", async () => {
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
        retryAfter = (
          result.data as { retryAfter?: string } | undefined | null
        )?.retryAfter;
      }

      expect(lastMessage).toBe("TOO_MANY_ATTEMPTS");
      expect(retryAfter).toBeDefined();
      expect(Date.parse(retryAfter as string)).toBeGreaterThan(Date.now() - 1000);
      expect(
        Date.parse(retryAfter as string) - Date.now(),
      ).toBeGreaterThan(50_000);
    });
  });

  describe("resend", () => {
    it("blocks resend before the cooldown elapses", async () => {
      await startAndGetCode();

      const result = await passwordResetService.resend({ email: EMAIL });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("RESEND_TOO_EARLY");
      expect(
        (result.data as { resendAvailableAt: string }).resendAvailableAt,
      ).toBeDefined();
    });
  });

  describe("confirm", () => {
    const getToken = async () => {
      const code = await startAndGetCode();
      const verified = await passwordResetService.verify({ email: EMAIL, code });
      if (!verified.success || verified.data.status !== "verified") {
        throw new Error("verify failed");
      }
      return verified.data.resetToken;
    };

    it("changes the password and clears the reset request", async () => {
      const resetToken = await getToken();

      const result = await passwordResetService.confirm({
        resetToken,
        newPassword: NEW_PASSWORD,
      });

      expect(result.success).toBe(true);

      const { rows } = await testDb.pool.query(
        `SELECT password_hash FROM users WHERE id = $1`,
        [userId],
      );
      expect(await bcrypt.compare(NEW_PASSWORD, rows[0].password_hash)).toBe(
        true,
      );

      const { rows: resets } = await testDb.pool.query(
        `SELECT COUNT(*) FROM password_resets WHERE user_id = $1`,
        [userId],
      );
      expect(Number(resets[0].count)).toBe(0);
    });

    it("rejects reusing the current password", async () => {
      const resetToken = await getToken();

      const result = await passwordResetService.confirm({
        resetToken,
        newPassword: OLD_PASSWORD,
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("SAME_PASSWORD");

      // The request is preserved so the user can choose another password.
      const { rows } = await testDb.pool.query(
        `SELECT COUNT(*) FROM password_resets WHERE user_id = $1`,
        [userId],
      );
      expect(Number(rows[0].count)).toBe(1);
    });

    it("rejects an invalid reset token", async () => {
      const result = await passwordResetService.confirm({
        resetToken: "tampered.token",
        newPassword: NEW_PASSWORD,
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe("RESET_TOKEN_INVALID");
    });
  });

  it("supports the full start → verify → confirm flow", async () => {
    const code = await startAndGetCode();

    const verified = await passwordResetService.verify({ email: EMAIL, code });
    expect(verified.success).toBe(true);
    if (!verified.success || verified.data.status !== "verified") return;

    const confirmed = await passwordResetService.confirm({
      resetToken: verified.data.resetToken,
      newPassword: NEW_PASSWORD,
    });
    expect(confirmed.success).toBe(true);

    const { rows } = await testDb.pool.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [userId],
    );
    expect(await bcrypt.compare(NEW_PASSWORD, rows[0].password_hash)).toBe(true);
  });

  it("returns EMAIL_DAILY_LIMIT after exceeding the daily send cap", async () => {
    const { config } = await import("../../src/shared/config/index.js");
    const limit = config.email.dailyLimitPerUser;
    if (limit <= 0) return;

    const day = new Date().toISOString().slice(0, 10);
    await testDb.pool.query(
      `INSERT INTO user_email_daily_sends (user_id, day, send_count)
       VALUES ($1, $2::date, $3)`,
      [userId, day, limit],
    );

    const result = await passwordResetService.start({ email: EMAIL });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.message).toBe("EMAIL_DAILY_LIMIT");
  });

  it("returns pending on start without sending when active reset already exists", async () => {
    await startAndGetCode();

    const { rows: before } = await testDb.pool.query(
      `SELECT send_count FROM user_email_daily_sends WHERE user_id = $1`,
      [userId],
    );

    const result = await passwordResetService.start({ email: EMAIL });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.status).toBe("pending");

    const { rows: after } = await testDb.pool.query(
      `SELECT send_count FROM user_email_daily_sends WHERE user_id = $1`,
      [userId],
    );
    expect(after[0]?.send_count).toBe(before[0]?.send_count);
  });

  it("returns pending on start when daily cap is reached but reset is still active", async () => {
    await startAndGetCode();

    const { config } = await import("../../src/shared/config/index.js");
    const limit = config.email.dailyLimitPerUser;
    if (limit <= 0) return;

    const day = new Date().toISOString().slice(0, 10);
    await testDb.pool.query(
      `UPDATE user_email_daily_sends
       SET send_count = $3
       WHERE user_id = $1 AND day = $2::date`,
      [userId, day, limit],
    );

    const result = await passwordResetService.start({ email: EMAIL });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.status).toBe("pending");
    expect(result.data.email).toBe(EMAIL);
  });

  it("allows exactly dailyLimitPerUser email sends per day", async () => {
    const { config } = await import("../../src/shared/config/index.js");
    const limit = config.email.dailyLimitPerUser;
    if (limit <= 0) return;

    for (let i = 0; i < limit; i += 1) {
      if (i === 0) {
        const result = await passwordResetService.start({ email: EMAIL });
        expect(result.success).toBe(true);
        continue;
      }

      await testDb.pool.query(
        `UPDATE password_resets
         SET resend_available_at = NOW() - INTERVAL '1 second'
         WHERE user_id = $1`,
        [userId],
      );

      const result = await passwordResetService.resend({ email: EMAIL });
      expect(result.success).toBe(true);
    }

    await testDb.pool.query(
      `UPDATE password_resets
       SET resend_available_at = NOW() - INTERVAL '1 second'
       WHERE user_id = $1`,
      [userId],
    );

    const limited = await passwordResetService.resend({ email: EMAIL });
    expect(limited.success).toBe(false);
    if (limited.success) return;
    expect(limited.message).toBe("EMAIL_DAILY_LIMIT");
  });
});
