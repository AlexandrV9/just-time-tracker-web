import { Hono } from "hono";
import { activitySessionSegmentsHandlers } from "./activitySessionSegment.handlers.js";

export const activitySessionSegmentsRouter = new Hono();

activitySessionSegmentsRouter.get(
  "/:id",
  activitySessionSegmentsHandlers.getById,
);
