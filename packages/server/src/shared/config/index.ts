import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../..",
);

// Root .env (Yandex, shared secrets) + packages/server/.env (local DB overrides)
// Vitest loads env in tests/setup/vitest.setup.ts — do not override here.
if (!process.env.VITEST) {
  dotenv.config({ path: path.join(repoRoot, ".env") });
  dotenv.config({
    path: path.join(repoRoot, "packages/server/.env"),
    override: true,
  });
}

export const config = {
  app: {
    clientPort: process.env.CLIENT_PORT || "3000",
    serverPort: process.env.SERVER_PORT || "9000",
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
  },

  auth: {
    accessToken: {
      expInSec: 60 * 3, // 60 seconds × 3 = 3 mintutes
      secret: process.env.ACCESS_TOKEN_SECRET!,
    },
    refreshToken: {
      expInSec: 60 * 60 * 24 * 7, // 60 seconds × 60 mintutes × 24 hours × 7 = 7 days
      cookie: "refresh_token",
      secret: process.env.REFRESH_TOKEN_SECRET!,
    },
  },

  yandex: {
    clientId: process.env.YANDEX_CLIENT_ID!,
    clientSecret: process.env.YANDEX_CLIENT_SECRET!,
    redirectUri: process.env.YANDEX_REDIRECT_URI!,
  },

  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
  },

  email: {
    transport: process.env.EMAIL_TRANSPORT || "console",
    from: process.env.EMAIL_FROM || "noreply@localhost",
    fromName: process.env.EMAIL_FROM_NAME || "Just Time Tracker",
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
    verification: {
      codeTtlSec: Number(process.env.EMAIL_CODE_TTL_SEC ?? 600),
      maxAttempts: Number(process.env.EMAIL_CODE_MAX_ATTEMPTS ?? 5),
      resendCooldownSec: Number(
        process.env.EMAIL_CODE_RESEND_COOLDOWN_SEC ?? 60,
      ),
    },
    /** Max verification/reset emails per user per UTC day. 0 = unlimited. */
    dailyLimitPerUser: Number(process.env.EMAIL_DAILY_LIMIT_PER_USER ?? 4),
  },

  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT || "mailto:noreply@localhost",
  },

  push: {
    enabled: Boolean(
      process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
    ),
  },

  rateLimit: {
    login: {
      maxRequestsPerMinutePerIp: Number(
        process.env.RATE_LIMIT_LOGIN_MAX_PER_MINUTE_IP ?? 5,
      ),
      maxFailuresBeforeLockout: Number(
        process.env.RATE_LIMIT_LOGIN_MAX_FAILURES ?? 5,
      ),
      lockoutDelaysSec: [
        1 * 60, // 1 min  (after 5 failures)
        5 * 60, // 5 min  (after 10 failures)
        15 * 60, // 15 min (after 15 failures)
        60 * 60, // 1 hour (after 20 failures)
        24 * 60 * 60, // 24 hours (after 25+ failures)
      ] as const,
    },
    passwordResetStart: {
      maxPerHourPerEmail: Number(
        process.env.RATE_LIMIT_RESET_MAX_PER_HOUR_EMAIL ?? 3,
      ),
    },
    emailVerificationStart: {
      maxPerHourPerEmail: Number(
        process.env.RATE_LIMIT_EMAIL_VERIFY_MAX_PER_HOUR ?? 3,
      ),
    },
  },
} as const;
