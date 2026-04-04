import { Hono } from "hono";
import { activityHandlers } from "./activity.handlers.js";

export const activitiesRouter = new Hono();

activitiesRouter.get("/", activityHandlers.getActivities);
activitiesRouter.post("/", activityHandlers.createActivity);
activitiesRouter.get(
  "/:id/sessions",
  activityHandlers.getActivitySessionsByActivityId,
);
activitiesRouter.get("/:id", activityHandlers.getActivityById);
activitiesRouter.patch("/:id", activityHandlers.updateActivity);
activitiesRouter.delete("/:id", activityHandlers.deleteActivity);

activitiesRouter.post("/:id/start", activityHandlers.startActivity);
activitiesRouter.post("/:id/pause", activityHandlers.pauseActivity);
activitiesRouter.post("/:id/finish", activityHandlers.finishActivity);
