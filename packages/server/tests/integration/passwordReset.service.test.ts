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

  describe("start", () => {
    it("creates a reset request and returns a dev code for an existing email", async () => {
      await startAndGetCode();

      const { rows } = await testDb.pool.query(
        `SELECT user_id FROM password_resets WHERE user_id = $1`,
        [userId],
      );
      expect(rows).toHaveLength(1);
    });

    it("responds success without creating a row for an unknown email", async () => {
      const result = await passwordResetService.start({
        email: "ghost@example.com",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.status).toBe("pending");
      expect(result.data.devCode).toBeUndefined();

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

    it("blocks after too many attempts and allows immediate resend", async () => {
      await startAndGetCode();

      let lastMessage = "";
      let resendAvailableAt: string | undefined;
      for (let i = 0; i < 5; i++) {
        const result = await passwordResetService.verify({
          email: EMAIL,
          code: "000000",
        });
        if (result.success) continue;
        lastMessage = result.message;
        resendAvailableAt = (
          result.data as { resendAvailableAt?: string } | undefined | null
        )?.resendAvailableAt;
      }

      expect(lastMessage).toBe("TOO_MANY_ATTEMPTS");
      expect(resendAvailableAt).toBeDefined();
      expect(Date.parse(resendAvailableAt as string)).toBeLessThanOrEqual(
        Date.now(),
      );
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
});
