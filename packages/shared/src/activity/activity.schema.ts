import z from "zod";
import { baseIdSchema, paginationResponseSchema } from "../common/index.js";
import { activitySessionSchema } from "./activitySession.schema.js";
import { activitySessionSegmentSchema } from "./activitySessionSegment.schema.js";

const tagListSchema = z.array(z.string()).max(10).optional();

export const createActivitySchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  description: z.string().max(1000).optional(),
  createdById: z.string().min(1, "createdById is required"),
  tags: tagListSchema,
});

export type CreateActivityDataDTO = z.infer<typeof createActivitySchema>;

export const activityStatusSchema = z.enum(["idle", "active", "paused"]);

export type ActivityStatusDTO = z.infer<typeof activityStatusSchema>;

export const activitySchema = z.object({
  id: z.string().min(1, "id is required"),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  createdById: z.string(),
  tags: z.array(z.string()),
  status: activityStatusSchema,
  currentSessionId: z.string().nullable(),
  activeDurationMs: z.number().int().nonnegative(),
  pauseDurationMs: z.number().int().nonnegative(),
});

export type ActivityDTO = z.infer<typeof activitySchema>;

export const getActivitiesSchema = z
  .object({
    createdById: z.string().optional(),
    tags: z.array(z.string()).optional(),
    search: z.string().optional(),
    exactTitle: z.string().min(1).max(255).optional(),
    page: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    fromDate: z.iso.datetime().optional(),
    toDate: z.iso.datetime().optional(),
    sortBy: z
      .enum(["createdAt", "updatedAt", "title"])
      .default("createdAt")
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  })
  .superRefine(({ fromDate, toDate }, ctx) => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      ctx.addIssue({
        path: ["toDate"],
        message: "toDate must be after fromDate",
        code: "custom",
      });
    }
  });

export type GetActivityDTO = z.infer<typeof baseIdSchema>;
export type GetActivitiesDTO = z.infer<typeof getActivitiesSchema>;

export const getCurrentActivitiesQuerySchema = z
  .object({
    createdById: z.string().min(1, "createdById is required"),
    fromDate: z.iso.datetime().optional(),
    toDate: z.iso.datetime().optional(),
    page: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: activityStatusSchema.optional(),
  })
  .superRefine(({ fromDate, toDate }, ctx) => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      ctx.addIssue({
        path: ["toDate"],
        message: "toDate must be after fromDate",
        code: "custom",
      });
    }
  });

export type GetCurrentActivitiesQueryDTO = z.infer<
  typeof getCurrentActivitiesQuerySchema
>;

/**
 * Response element for GET /activities/current.
 *
 * NOTE on duration semantics: `activity.activeDurationMs` and `activity.pauseDurationMs`
 * are **interval-scoped** — sums within `[fromDate, toDate)`, aligned with analytics
 * (open segments clipped with server `now()` and capped by `toDate`).
 * `activity.status` reflects the last session backing this row (same join as `/current` filter).
 *
 * `session` / `segment` are the backing session and its current segment row (if any),
 * for UI such as cross-day cards; omitted semantics: `session` is null for `idle` rows.
 *
 * Home UI: live **session** active time uses `session.activeDurationMs` plus the open active
 * segment elapsed; **day** totals for the list use interval-scoped `activity.activeDurationMs`.
 */
export const currentActivitySchema = z.object({
  activity: activitySchema,
  session: activitySessionSchema.nullable(),
  segment: activitySessionSegmentSchema.nullable(),
});

export type CurrentActivityDTO = z.infer<typeof currentActivitySchema>;

export const currentActivitiesResponseSchema = paginationResponseSchema(
  currentActivitySchema,
);

export type GetCurrentActivitiesResponseDTO = z.infer<
  typeof currentActivitiesResponseSchema
>;

export const getActivitiesByIdsSchema = z.object({
  activityIds: z.array(z.string().min(1, "activityId is required")),
});

export type GetActivitiesByIdsDTO = z.infer<typeof getActivitiesByIdsSchema>;

export const updateActivitySchema = z.object({
  id: z.string().min(1, "id is required"),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  tags: tagListSchema,
});

export type UpdateActivityDataDTO = z.infer<typeof updateActivitySchema>;

export const deleteActivitySchema = baseIdSchema;

export type DeleteActivityDataDTO = z.infer<typeof deleteActivitySchema>;

export const startActivitySchema = z.object({
  activityId: z.string().min(1, "activityId is required"),
  startedAt: z.iso.datetime(),
});

export type StartActivityDataDTO = z.infer<typeof startActivitySchema>;

export const pauseActivitySchema = z.object({
  activityId: z.string().min(1, "activityId is required"),
  pausedAt: z.iso.datetime(),
});

export type PauseActivityDataDTO = z.infer<typeof pauseActivitySchema>;

export const finishActivitySchema = z.object({
  activityId: z.string().min(1, "activityId is required"),
  finishedAt: z.iso.datetime(),
});

export type FinishActivityDataDTO = z.infer<typeof finishActivitySchema>;

export const activitiesSchema = paginationResponseSchema(activitySchema);

export type GetActivitiesResponseDTO = z.infer<typeof activitiesSchema>;

export const getActivitySession = z.object({
  id: z.string().min(1, "Id is required"),
});

export type GetActivitySessionDTO = z.infer<typeof getActivitySession>;

export const getActivitySessions = z.object({
  activityId: z.string().min(1, "activityId is required"),
  fromDate: z.iso.datetime().optional(),
  toDate: z.iso.datetime().optional(),
});

export type GetActivitySessionsDTO = z.infer<typeof getActivitySessions>;

export const getActivitySessionsSchema = z
  .object({
    fromDate: z.iso.datetime().optional(),
    toDate: z.iso.datetime().optional(),
    sortBy: z
      .enum(["startedAt", "endedAt", "status"])
      .default("startedAt")
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  })
  .superRefine(({ fromDate, toDate }, ctx) => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      ctx.addIssue({
        path: ["toDate"],
        message: "toDate must be after fromDate",
        code: "custom",
      });
    }
  });

export const getActivitySessionsResponseSchema = z.object({
  sessions: z.array(activitySessionSchema),
});

export type GetActivitySessionsResponseDTO = z.infer<
  typeof getActivitySessionsResponseSchema
>;

export const getActivityAnalyticsSchema = z.object({
  activityId: z.string().min(1, "activityId is required"),
  fromDate: z.iso.datetime().optional(),
  toDate: z.iso.datetime().optional(),
});

export type GetActivityAnalyticsDTO = z.infer<
  typeof getActivityAnalyticsSchema
>;

/** Query string for `GET /activities/:id/analytics`. */
export const getActivityAnalyticsQuerySchema = z
  .object({
    fromDate: z.iso.datetime().optional(),
    toDate: z.iso.datetime().optional(),
  })
  .superRefine(({ fromDate, toDate }, ctx) => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      ctx.addIssue({
        path: ["toDate"],
        message: "toDate must be after fromDate",
        code: "custom",
      });
    }
  });

export type GetActivityAnalyticsQueryDTO = z.infer<
  typeof getActivityAnalyticsQuerySchema
>;

export const getActivityAnalyticsResponseSchema = z.object({
  activityId: z.string().min(1, "activityId is required"),
  activeDurationMs: z.number().int().nonnegative(),
  pauseDurationMs: z.number().int().nonnegative(),
  days: z.array(
    z.object({
      day: z.iso.datetime(),
      activeDurationMs: z.number().int().nonnegative(),
      pauseDurationMs: z.number().int().nonnegative(),
    }),
  ),
});

export type GetActivityAnalyticsResponseDTO = z.infer<
  typeof getActivityAnalyticsResponseSchema
>;

export const getActivitiesAnalyticsQuerySchema = z
  .object({
    activityIds: z
      .union([z.string(), z.array(z.string())])
      .transform((v) => (Array.isArray(v) ? v : [v])),
    fromDate: z.iso.datetime().optional(),
    toDate: z.iso.datetime().optional(),
  })
  .superRefine(({ fromDate, toDate }, ctx) => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      ctx.addIssue({
        path: ["toDate"],
        message: "toDate must be after fromDate",
        code: "custom",
      });
    }
  });

export type GetActivitiesAnalyticsQueryDTO = z.infer<
  typeof getActivitiesAnalyticsQuerySchema
>;

export const getActivitiesAnalyticsResponseSchema = z.object({
  items: z.record(z.string(), getActivityAnalyticsResponseSchema),
});

export type GetActivitiesAnalyticsResponseDTO = z.infer<
  typeof getActivitiesAnalyticsResponseSchema
>;

/** Одна строка списка внутри группы: карточка активности + время за интервал группы. */
export const groupedActivityTimeRowSchema = z.object({
  activity: activitySchema,
  activeDurationMs: z.number().int().nonnegative(),
  pauseDurationMs: z.number().int().nonnegative(),
});

export type GroupedActivityTimeRowDTO = z.infer<
  typeof groupedActivityTimeRowSchema
>;

export const groupedItemsPaginationSchema = z.object({
  hasNext: z.boolean(),
  nextCursor: z.string().nullable(),
});

/** Один календарный bucket (день / неделя / месяц) в ответе `GET /activities/grouped`. */
export const activityGroupSchema = z.object({
  groupBy: z.enum(["day", "week", "month"]),
  groupDateStart: z.iso.datetime(), // inclusive
  groupDateEnd: z.iso.datetime(), // exclusive
  totalActiveDurationMs: z.number().int().nonnegative(),
  totalPauseDurationMs: z.number().int().nonnegative(),
  items: z.array(groupedActivityTimeRowSchema),
  itemsPagination: groupedItemsPaginationSchema,
});

export type ActivityGroupDTO = z.infer<typeof activityGroupSchema>;

export const getGroupedActivitiesResponseSchema = z.object({
  groups: z.array(activityGroupSchema),
  groupsPagination: z.object({
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
});

export type GetGroupedActivitiesResponseDTO = z.infer<
  typeof getGroupedActivitiesResponseSchema
>;

export const getGroupedActivitiesQuerySchema = z.object({
  createdById: z.string().min(1, "createdById is required"),
  groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
  groupCursor: z.string().min(1).optional(),
  groupLimit: z.coerce.number().int().positive().max(100).optional().default(5),
  itemsLimit: z.coerce.number().int().positive().max(100).optional().default(8),
  fromDate: z.iso.datetime().optional(),
  toDate: z.iso.datetime().optional(),
});

export type GetGroupedActivitiesQueryDTO = z.infer<
  typeof getGroupedActivitiesQuerySchema
>;

/** Query для `GET /activities/grouped/items` — догрузка списка активностей внутри одной группы. */
export const getGroupedActivityItemsQuerySchema = z.object({
  createdById: z.string().min(1, "createdById is required"),
  cursor: z.string().min(1, "cursor is required"),
  limit: z.coerce.number().int().positive().max(100).optional().default(8),
});

export type GetGroupedActivityItemsQueryDTO = z.infer<
  typeof getGroupedActivityItemsQuerySchema
>;

export const getGroupedActivityItemsResponseSchema = z.object({
  groupBy: z.enum(["day", "week", "month"]),
  groupDateStart: z.iso.datetime(),
  groupDateEnd: z.iso.datetime(),
  items: z.array(groupedActivityTimeRowSchema),
  pagination: groupedItemsPaginationSchema,
});

export type GetGroupedActivityItemsResponseDTO = z.infer<
  typeof getGroupedActivityItemsResponseSchema
>;
