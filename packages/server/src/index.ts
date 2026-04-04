import { serve } from "@hono/node-server";
import { Hono } from "hono";
// import { cors } from "hono/cors";
import { authMiddleware, authRouter } from "./auth/index.js";
import { config } from "./shared/index.js";
import { healthRouter } from "./health/health.routes.js";
import { activitiesRouter } from "./activity/activity.routes.js";
import { activitySessionsRouter } from "./activity/activitySession.routes.js";

const app = new Hono();

// app.use(
//   "*",
//   cors({
//     origin: `http://localhost:${appConfig.clientPort}`,
//     credentials: true,
//   })
// );

app.route("/auth", authRouter);
app.route("/health", healthRouter);

// app.use("/tasks/*", authMiddleware);

app.route("/activities", activitiesRouter);
app.route("/activity-sessions", activitySessionsRouter);

serve(
  {
    fetch: app.fetch,
    port: Number(config.app.serverPort),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
