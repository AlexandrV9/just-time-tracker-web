import { Hono } from "hono";
import { activityHandlers } from "./activity.handlers.js";

export const activitiesRouter = new Hono();

activitiesRouter.get("/", activityHandlers.getActivities);
activitiesRouter.post("/", activityHandlers.createActivity);
activitiesRouter.patch("/", activityHandlers.updateActivity);

activitiesRouter.get("/:id", activityHandlers.getActivityById);
activitiesRouter.delete("/:id", activityHandlers.deleteActivity);
