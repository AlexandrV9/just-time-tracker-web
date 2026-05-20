import { Hono } from "hono";
import { activityHandlers } from "./activity.handlers.js";

export const activitiesRouter = new Hono();

activitiesRouter.post("/", activityHandlers.createActivity);
activitiesRouter.post("/by-ids", activityHandlers.getActivitiesByIds);
activitiesRouter.get("/", activityHandlers.getActivities);
activitiesRouter.get("/current", activityHandlers.getCurrentActivities);
activitiesRouter.get("/tracked", activityHandlers.getTrackedActivities);
activitiesRouter.get("/grouped/items", activityHandlers.getGroupedActivityItems);
activitiesRouter.get("/grouped", activityHandlers.getGroupedActivities);
activitiesRouter.get("/analytics", activityHandlers.getActivitiesAnalytics);
activitiesRouter.get("/:id/analytics", activityHandlers.getActivityAnalytics);
activitiesRouter.get("/:id/sessions", activityHandlers.getSessionsByActivityId);
activitiesRouter.get(
  "/:id/session-segments",
  activityHandlers.getSessionSegmentsByActivityId,
);
activitiesRouter.get("/:id", activityHandlers.getActivityById);
activitiesRouter.patch("/:id", activityHandlers.updateActivity);
activitiesRouter.delete("/:id", activityHandlers.deleteActivity);

activitiesRouter.post("/start", activityHandlers.startActivity);
activitiesRouter.post("/pause", activityHandlers.pauseActivity);
activitiesRouter.post("/finish", activityHandlers.finishActivity);
