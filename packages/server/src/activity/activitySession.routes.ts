import { Hono } from "hono";
import { activitySessionHandlers } from "./activitySession.handlers.js";

export const activitySessionsRouter = new Hono();

activitySessionsRouter.get("/:id", activitySessionHandlers.getById);
activitySessionsRouter.delete("/:id", activitySessionHandlers.deleteById);
