import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware, authRouter, yandexHandlers } from "./auth/index.js";
import type { AuthVariables } from "./shared/auth/auth.variables.js";
import { config } from "./shared/index.js";
import { healthRouter } from "./health/health.routes.js";
import {
  activitiesRouter,
  activitySessionSegmentsRouter,
  activitySessionsRouter,
} from "./activity/index.js";
import { dayPlanItemsRouter, dayPlansRouter } from "./dayPlan/index.js";
import { emailVerificationRouter, usersRouter } from "./user/index.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  }),
);

app.route("/auth", authRouter);
app.route("/health", healthRouter);

const protectedRouter = new Hono<{ Variables: AuthVariables }>();
protectedRouter.use("*", authMiddleware);
protectedRouter.route("/activities", activitiesRouter);
protectedRouter.route("/activity-sessions", activitySessionsRouter);
protectedRouter.route(
  "/activity-session-segments",
  activitySessionSegmentsRouter,
);
protectedRouter.route("/day-plans", dayPlansRouter);
protectedRouter.route("/day-plan-items", dayPlanItemsRouter);
protectedRouter.route("/users", usersRouter);
protectedRouter.route("/email-verification", emailVerificationRouter);
protectedRouter.post("/auth/yandex/link", yandexHandlers.startLink);

app.route("/", protectedRouter);

serve(
  {
    fetch: app.fetch,
    port: Number(config.app.serverPort),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
