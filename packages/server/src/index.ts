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
import { emailVerificationRouter } from "./emailVerification/index.js";
import { usersRouter } from "./user/index.js";
import {
  CompositeNotificationSender,
  ConsoleNotificationSender,
  createNotificationWorker,
  MAX_NOTIFICATION_DELIVERY_LAG_MS,
  PushNotificationSender,
  pushSubscriptionsRouter,
  setNotificationJobsChangeListener,
  SseNotificationSender,
} from "./modules/notifications/index.js";

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
protectedRouter.route("/push-subscriptions", pushSubscriptionsRouter);
protectedRouter.route("/email-verification", emailVerificationRouter);
// protectedRouter.post("/auth/yandex/link", yandexHandlers.startLink);

app.route("/", protectedRouter);

const notificationWorker = createNotificationWorker({
  sender: new CompositeNotificationSender([
    new ConsoleNotificationSender(),
    new SseNotificationSender(),
    new PushNotificationSender(),
  ]),
});

setNotificationJobsChangeListener(() => {
  void notificationWorker.reschedule();
});

serve(
  {
    fetch: app.fetch,
    port: Number(config.app.serverPort),
  },
  (info) => {
    notificationWorker.start();

    console.log(
      `Server is running on http://localhost:${info.port} (NODE_ENV=${config.app.nodeEnv})`,
    );
    console.log(`Email transport: ${config.email.transport}`);
    if (config.email.transport === "console") {
      console.log(
        "Verification codes → server log [EmailService:console] + browser DevTools [dev] ...",
      );
    }
    console.log(
      `Notification worker started (max delivery lag: ${MAX_NOTIFICATION_DELIVERY_LAG_MS / 1000}s)`,
    );
  },
);
