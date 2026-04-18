import { Hono } from "hono";
import { activityHandlers } from "./activity.handlers.js";

export const activitiesRouter = new Hono();

activitiesRouter.post("/", activityHandlers.createActivity);
activitiesRouter.post("/quick-timer", activityHandlers.createActivityFromQuickTimer);
activitiesRouter.post("/by-ids", activityHandlers.getActivitiesByIds);
activitiesRouter.get("/", activityHandlers.getActivities);
activitiesRouter.get("/analytics", activityHandlers.getBatchActivityAnalytics);
activitiesRouter.get("/:id/analytics", activityHandlers.getActivityAnalytics);
activitiesRouter.get("/:id/sessions", activityHandlers.getSessionsByActivityId);
activitiesRouter.get("/:id", activityHandlers.getActivityById);
activitiesRouter.patch("/:id", activityHandlers.updateActivity);
activitiesRouter.delete("/:id", activityHandlers.deleteActivity);

activitiesRouter.post("/:id/start", activityHandlers.startActivity);
activitiesRouter.post("/:id/pause", activityHandlers.pauseActivity);
activitiesRouter.post("/:id/finish", activityHandlers.finishActivity);
