import { Hono } from "hono";
import type { AuthVariables } from "../shared/auth/auth.variables.js";

import { dayPlanHandlers } from "./handlers.js";

export const dayPlansRouter = new Hono<{ Variables: AuthVariables }>();

dayPlansRouter.post("/", dayPlanHandlers.createDayPlan);
dayPlansRouter.get("/", dayPlanHandlers.getDayPlans);
dayPlansRouter.get("/by-range", dayPlanHandlers.getDayPlansByRange);
dayPlansRouter.get("/:id", dayPlanHandlers.getDayPlanById);
dayPlansRouter.patch("/:id", dayPlanHandlers.updateDayPlan);
dayPlansRouter.delete("/:id", dayPlanHandlers.deleteDayPlan);
