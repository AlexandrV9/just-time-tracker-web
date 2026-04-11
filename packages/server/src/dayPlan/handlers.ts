import { zValidator } from "@hono/zod-validator";
import {
  baseIdSchema,
  createDayPlanItemSchema,
  createDayPlanSchema,
  deleteDayPlanItemSchema,
  deleteDayPlanSchema,
  getDayPlanItemsSchema,
  getDayPlansSchema,
  updateDayPlanItemSchema,
  updateDayPlanSchema,
} from "@to-do-list/shared";

import { dayPlanItemsService } from "./dayPlanItem.service.js";
import { dayPlansService } from "./dayPlan.service.js";
import { validationUtils } from "../shared/index.js";

type ValidatorType = "json" | "param" | "query";

const createHandler = (
  type: ValidatorType,
  schema: any,
  serviceMethod: Function,
  successStatus = 200,
) =>
  zValidator(type, schema, async (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validation failed",
          data: validationUtils.formatZodErrors(result.error.message),
        },
        400,
      );
    }

    try {
      const responseData = await serviceMethod(result.data);
      return c.json(responseData as any, successStatus as any);
    } catch (error) {
      console.error("Handler error:", error);
      return c.json(
        {
          success: false,
          message: "Internal server error",
        },
        500,
      );
    }
  });

export const dayPlanHandlers = {
  createDayPlan: createHandler(
    "json",
    createDayPlanSchema,
    dayPlansService.createDayPlan,
    201,
  ),
  getDayPlans: createHandler(
    "query",
    getDayPlansSchema,
    dayPlansService.getDayPlans,
  ),
  getDayPlanById: createHandler(
    "param",
    baseIdSchema,
    dayPlansService.getDayPlanById,
  ),
  updateDayPlan: createHandler(
    "json",
    updateDayPlanSchema,
    dayPlansService.updateDayPlan,
  ),
  deleteDayPlan: createHandler(
    "param",
    deleteDayPlanSchema,
    dayPlansService.deleteDayPlan,
  ),
};

export const dayPlanItemHandlers = {
  createDayPlanItem: createHandler(
    "json",
    createDayPlanItemSchema,
    dayPlanItemsService.createDayPlanItem,
    201,
  ),
  getDayPlanItems: createHandler(
    "query",
    getDayPlanItemsSchema,
    dayPlanItemsService.getDayPlanItems,
  ),
  getDayPlanItemById: createHandler(
    "param",
    baseIdSchema,
    dayPlanItemsService.getDayPlanItemById,
  ),
  updateDayPlanItem: createHandler(
    "json",
    updateDayPlanItemSchema,
    dayPlanItemsService.updateDayPlanItem,
  ),
  deleteDayPlanItem: createHandler(
    "param",
    deleteDayPlanItemSchema,
    dayPlanItemsService.deleteDayPlanItem,
  ),
};
