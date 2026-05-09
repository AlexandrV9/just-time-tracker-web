import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { validationUtils } from "../shared/index.js";

import { activitiesService } from "./activity.service.js";
import {
  baseIdSchema,
  createActivitySchema,
  updateActivitySchema,
  getActivitiesSchema,
  getCurrentActivitiesQuerySchema,
  getActivitiesByIdsSchema,
  getActivitySessionsSchema,
  getActivityAnalyticsQuerySchema,
  getActivitiesAnalyticsQuerySchema,
  createActivityFromQuickTimerSchema,
  getGroupedActivitiesQuerySchema,
  getGroupedActivityItemsQuerySchema,
  getActivitySessionSegmentsSchema,
  startActivitySchema,
  pauseActivitySchema,
  finishActivitySchema,
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

  getCurrentActivities: createHandler(
    "query",
    getCurrentActivitiesQuerySchema,
    activitiesService.getCurrentActivities,
  ),

  getActivitiesByIds: createHandler(
    "json",
    getActivitiesByIdsSchema,
    activitiesService.getActivitiesByIds,
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
    "json",
    startActivitySchema,
    activitiesService.startActivity,
  ),

  pauseActivity: createHandler(
    "json",
    pauseActivitySchema,
    activitiesService.pauseActivity,
  ),

  finishActivity: createHandler(
    "json",
    finishActivitySchema,
    activitiesService.finishActivity,
  ),

  getGroupedActivities: createHandler(
    "query",
    getGroupedActivitiesQuerySchema,
    activitiesService.getGroupedActivities,
  ),

  getGroupedActivityItems: createHandler(
    "query",
    getGroupedActivityItemsQuerySchema,
    activitiesService.getGroupedActivityItems,
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

  getSessionSegmentsByActivityId: async (c: Context) => {
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

    const queryParsed = getActivitySessionSegmentsSchema.safeParse({
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
      const responseData =
        await activitiesService.getSessionSegmentsByActivityId({
          activityId: idParsed.data.id,
          ...queryParsed.data,
        });

      return c.json(responseData);
    } catch (error) {
      console.error("Handler error:", error);
      return c.json({ success: false, message: "Internal server error" }, 500);
    }
  },

  getActivitiesAnalytics: async (c: Context) => {
    // Axios serializes arrays as `activityIds[]=id1&activityIds[]=id2` (bracket format).
    // Hono's c.req.queries() looks for the exact key, so we try both forms.
    const rawIds = [
      ...(c.req.queries("activityIds") ?? []),
      ...(c.req.queries("activityIds[]") ?? []),
    ];
    const fromDate = c.req.query("fromDate") ?? undefined;
    const toDate = c.req.query("toDate") ?? undefined;

    const parsed = getActivitiesAnalyticsQuerySchema.safeParse({
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
      const responseData = await activitiesService.getActivitiesAnalytics(
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
