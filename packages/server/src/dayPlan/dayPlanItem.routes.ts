import { Hono } from "hono";

import { dayPlanItemHandlers } from "./handlers.js";

export const dayPlanItemsRouter = new Hono();

dayPlanItemsRouter.post("/batch", dayPlanItemHandlers.addDayPlanItems);
dayPlanItemsRouter.post("/", dayPlanItemHandlers.createDayPlanItem);
dayPlanItemsRouter.get("/", dayPlanItemHandlers.getDayPlanItems);
dayPlanItemsRouter.get("/:id", dayPlanItemHandlers.getDayPlanItemById);
dayPlanItemsRouter.patch("/:id", dayPlanItemHandlers.updateDayPlanItem);
dayPlanItemsRouter.delete("/:id", dayPlanItemHandlers.deleteDayPlanItem);
