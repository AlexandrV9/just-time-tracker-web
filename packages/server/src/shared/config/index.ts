import dotenv from "dotenv";

dotenv.config();

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
