import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { validationUtils } from "../shared/index.js";

import { activitiesService } from "./activity.service.js";
import {
  baseIdSchema,
  createActivitySchema,
  updateActivitySchema,
  getActivitiesSchema,
  getActivitySessionsSchema,
} from "@to-do-list/shared";

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

      const statusCode = successStatus;

      return c.json(responseData, statusCode as any);
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

export const activityHandlers = {
  getActivityById: createHandler(
    "param",
    baseIdSchema,
    activitiesService.getActivityById,
  ),

  getActivities: createHandler(
    "query",
    getActivitiesSchema,
    activitiesService.getActivities,
  ),

  createActivity: createHandler(
    "json",
    createActivitySchema,
    activitiesService.createActivity,
    201,
  ),

  updateActivity: createHandler(
    "json",
    updateActivitySchema,
    activitiesService.updateActivity,
  ),

  deleteActivity: createHandler(
    "param",
    baseIdSchema,
    activitiesService.deleteActivity,
  ),

  playSession: createHandler(
    "param",
    baseIdSchema,
    activitiesService.playSession,
  ),

  pauseSession: createHandler(
    "param",
    baseIdSchema,
    activitiesService.pauseSession,
  ),

  finishSession: createHandler(
    "param",
    baseIdSchema,
    activitiesService.finishActivity,
  ),

  getActivitySessionsByActivityId: async (c: Context) => {
    const activityId = c.req.param("id");

    if (!activityId) {
      return c.json({ success: false, message: "Missing activity id" }, 400);
    }

    const parsed = getActivitySessionsSchema.safeParse({
      fromDate: c.req.query("fromDate") ?? undefined,
      toDate: c.req.query("toDate") ?? undefined,
    });

    if (!parsed.success) {
      return c.json(
        {
          success: false,
          message: "Validation failed",
          data: validationUtils.formatZodErrors(parsed.error.message),
        },
        400,
      );
    }

    try {
      const responseData =
        await activitiesService.getActivitySessionsByActivityId({
          activityId,
          ...parsed.data,
        });

      return c.json(responseData);
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
  },
};
