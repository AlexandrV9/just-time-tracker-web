import { Hono } from "hono";

import { dayPlanHandlers } from "./handlers.js";

export const dayPlansRouter = new Hono();

dayPlansRouter.post("/", dayPlanHandlers.createDayPlan);
dayPlansRouter.get("/", dayPlanHandlers.getDayPlans);
dayPlansRouter.get("/:id", dayPlanHandlers.getDayPlanById);
dayPlansRouter.patch("/:id", dayPlanHandlers.updateDayPlan);
dayPlansRouter.delete("/:id", dayPlanHandlers.deleteDayPlan);
