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
  getActivityAnalyticsQuerySchema,
  getBatchActivityAnalyticsQuerySchema,
  createActivityFromQuickTimerSchema,
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

  createActivityFromQuickTimer: createHandler(
    "json",
    createActivityFromQuickTimerSchema,
    activitiesService.createActivityFromQuickTimer,
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

  startActivity: createHandler(
    "param",
    baseIdSchema,
    activitiesService.startActivity,
  ),

  pauseActivity: createHandler(
    "param",
    baseIdSchema,
    activitiesService.pauseActivity,
  ),

  finishActivity: createHandler(
    "param",
    baseIdSchema,
    activitiesService.finishActivity,
  ),

  getSessionsByActivityId: async (c: Context) => {
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
      const responseData = await activitiesService.getSessionsByActivityId({
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

  getBatchActivityAnalytics: async (c: Context) => {
    const rawIds = c.req.queries("activityIds") ?? [];
    const fromDate = c.req.query("fromDate") ?? undefined;
    const toDate = c.req.query("toDate") ?? undefined;

    const parsed = getBatchActivityAnalyticsQuerySchema.safeParse({
      activityIds: rawIds,
      fromDate,
      toDate,
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
      const responseData = await activitiesService.getBatchActivityAnalytics(
        parsed.data,
      );
      return c.json(responseData);
    } catch (error) {
      console.error("Handler error:", error);
      return c.json({ success: false, message: "Internal server error" }, 500);
    }
  },

  getActivityAnalytics: async (c: Context) => {
    const activityId = c.req.param("id");
    if (!activityId) {
      return c.json({ success: false, message: "Missing activity id" }, 400);
    }

    const idParsed = baseIdSchema.safeParse({ id: activityId });
    if (!idParsed.success) {
      return c.json(
        {
          success: false,
          message: "Validation failed",
          data: validationUtils.formatZodErrors(idParsed.error.message),
        },
        400,
      );
    }

    const queryParsed = getActivityAnalyticsQuerySchema.safeParse({
      fromDate: c.req.query("fromDate") ?? undefined,
      toDate: c.req.query("toDate") ?? undefined,
    });

    if (!queryParsed.success) {
      return c.json(
        {
          success: false,
          message: "Validation failed",
          data: validationUtils.formatZodErrors(queryParsed.error.message),
        },
        400,
      );
    }

    try {
      const responseData = await activitiesService.getActivityAnalytics({
        activityId: idParsed.data.id,
        ...queryParsed.data,
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
