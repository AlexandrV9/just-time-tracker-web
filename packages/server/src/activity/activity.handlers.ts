import { activitiesService } from "./activity.service.js";

import {
  baseIdSchema,
  createActivitySchema,
  updateActivitySchema,
  getActivitiesSchema,
  getCurrentActivitiesQuerySchema,
  getTrackedActivitiesQuerySchema,
  getActivitiesByIdsSchema,
  getActivitySessionsByActivityIdParamsSchema,
  getActivityAnalyticsByActivityIdParamsSchema,
  getActivitiesAnalyticsQuerySchema,
  getGroupedActivitiesQuerySchema,
  getGroupedActivityItemsQuerySchema,
  getActivitySessionSegmentsByActivityIdParamsSchema,
  startActivitySchema,
  pauseActivitySchema,
  finishActivitySchema,
} from "@to-do-list/shared";

import {
  createValidatedHandler,
  getArrayQueryParam,
} from "../shared/utils/request.js";

export const activityHandlers = {
  getActivityById: createValidatedHandler({
    parse: (c) => ({ id: c.req.param("id") }),
    schema: baseIdSchema,
    service: activitiesService.getActivityById,
  }),

  getActivities: createValidatedHandler({
    parse: (c) => c.req.query(),
    schema: getActivitiesSchema,
    service: activitiesService.getActivities,
  }),

  getCurrentActivities: createValidatedHandler({
    parse: (c) => c.req.query(),
    schema: getCurrentActivitiesQuerySchema,
    service: activitiesService.getCurrentActivities,
  }),

  getTrackedActivities: createValidatedHandler({
    parse: (c) => c.req.query(),
    schema: getTrackedActivitiesQuerySchema,
    service: activitiesService.getTrackedActivities,
  }),

  getActivitiesByIds: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: getActivitiesByIdsSchema,
    service: activitiesService.getActivitiesByIds,
  }),

  createActivity: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: createActivitySchema,
    service: activitiesService.createActivity,
    successStatus: 201,
  }),

  updateActivity: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: updateActivitySchema,
    service: activitiesService.updateActivity,
  }),

  deleteActivity: createValidatedHandler({
    parse: (c) => ({ id: c.req.param("id") }),
    schema: baseIdSchema,
    service: activitiesService.deleteActivity,
  }),

  startActivity: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: startActivitySchema,
    service: activitiesService.startActivity,
  }),

  pauseActivity: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: pauseActivitySchema,
    service: activitiesService.pauseActivity,
  }),

  finishActivity: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: finishActivitySchema,
    service: activitiesService.finishActivity,
  }),

  getGroupedActivities: createValidatedHandler({
    parse: (c) => c.req.query(),
    schema: getGroupedActivitiesQuerySchema,
    service: activitiesService.getGroupedActivities,
  }),

  getGroupedActivityItems: createValidatedHandler({
    parse: (c) => c.req.query(),
    schema: getGroupedActivityItemsQuerySchema,
    service: activitiesService.getGroupedActivityItems,
  }),

  getSessionsByActivityId: createValidatedHandler({
    parse: (c) => ({
      id: c.req.param("id"),
      ...c.req.query(),
    }),
    schema: getActivitySessionsByActivityIdParamsSchema,
    service: activitiesService.getSessionsByActivityId,
    map: ({ id, ...query }) => ({
      activityId: id,
      ...query,
    }),
  }),

  getSessionSegmentsByActivityId: createValidatedHandler({
    parse: (c) => ({
      id: c.req.param("id"),
      ...c.req.query(),
    }),
    schema: getActivitySessionSegmentsByActivityIdParamsSchema,
    service: activitiesService.getSessionSegmentsByActivityId,
    map: ({ id, ...query }) => ({ activityId: id, ...query }),
  }),

  getActivitiesAnalytics: createValidatedHandler({
    parse: (c) => ({
      activityIds: getArrayQueryParam(c, "activityIds"),
      fromDate: c.req.query("fromDate"),
      toDate: c.req.query("toDate"),
    }),
    schema: getActivitiesAnalyticsQuerySchema,
    service: activitiesService.getActivitiesAnalytics,
  }),

  getActivityAnalytics: createValidatedHandler({
    parse: (c) => ({
      id: c.req.param("id"),
      ...c.req.query(),
    }),
    schema: getActivityAnalyticsByActivityIdParamsSchema,
    service: activitiesService.getActivityAnalytics,
    map: ({ id, ...query }) => ({ activityId: id, ...query }),
  }),
};
