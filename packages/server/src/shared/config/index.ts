import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../..",
);

// Root .env (Yandex, shared secrets) + packages/server/.env (local DB overrides)
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({
  path: path.join(repoRoot, "packages/server/.env"),
  override: true,
});

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
} as const;
