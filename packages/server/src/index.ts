import { serve } from "@hono/node-server";
import { Hono } from "hono";
// import { cors } from "hono/cors";
import { authMiddleware, authRouter } from "./auth/index.js";
import { tasksRouter } from "./task/index.js";
import { config } from "./shared/index.js";
import { healthRouter } from "./health/health.routes.js";
import { timeEntriesRouter } from "./timeEntry/timeEntry.routes.js";
import { timeEntryTemplatesRouter } from "./timeEntryTemplate/timeEntryTemplate.routes.js";
import { activitiesRouter } from "./activity/activity.routes.js";

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

app.use("/tasks/*", authMiddleware);
app.route("/tasks", tasksRouter);

app.route("/time-entries", timeEntriesRouter);
app.route("/time-entry-templates", timeEntryTemplatesRouter);
app.route("/activities", activitiesRouter);

serve(
  {
    fetch: app.fetch,
    port: Number(config.app.serverPort),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
