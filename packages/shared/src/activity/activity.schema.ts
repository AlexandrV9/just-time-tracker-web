import z from "zod";
import { baseIdSchema, paginationResponseSchema } from "../common/index.js";
import { activitySessionSchema } from "./activitySession.schema.js";

const tagListSchema = z.array(z.string()).max(10).optional();

export const createActivitySchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  description: z.string().max(1000).optional(),
  createdById: z.string().min(1, "createdById is required"),
  tags: tagListSchema,
});

export type CreateActivityDataDTO = z.infer<typeof createActivitySchema>;

export const createActivityFromQuickTimerSchema = z.object({
  title: z.string().max(255).optional(),
  createdById: z.string().min(1, "createdById is required"),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime(),
});

export type CreateActivityFromQuickTimerDataDTO = z.infer<
  typeof createActivityFromQuickTimerSchema
>;

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
  status: activityStatusSchema, // возможно убрать в будущем
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

export const startActivity = z.object({
  activityId: z.string().min(1, "activityId is required"),
});

export type StartActivityDTO = z.infer<typeof startActivity>;

export const pauseActivity = z.object({
  activityId: z.string().min(1, "activityId is required"),
});

export type PauseActivityDTO = z.infer<typeof pauseActivity>;

export const finishActivity = z.object({
  activityId: z.string().min(1, "activityId is required"),
});

export type FinishActivityDTO = z.infer<typeof finishActivity>;

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
  fromDate: z.iso.datetime(),
  toDate: z.iso.datetime(),
  totals: z.object({
    activeDurationMs: z.number().int().nonnegative(),
    pauseDurationMs: z.number().int().nonnegative(),
    totalDurationMs: z.number().int().nonnegative(),
  }),
  days: z.array(
    z.object({
      day: z.iso.datetime(),
      totals: z.object({
        activeDurationMs: z.number().int().nonnegative(),
        pauseDurationMs: z.number().int().nonnegative(),
        totalDurationMs: z.number().int().nonnegative(),
      }),
    }),
  ),
});

export type GetActivityAnalyticsResponseDTO = z.infer<
  typeof getActivityAnalyticsResponseSchema
>;

/** Query string for `GET /activities/analytics` (batch). */
export const getBatchActivityAnalyticsQuerySchema = z
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

export type GetBatchActivityAnalyticsDTO = z.infer<
  typeof getBatchActivityAnalyticsQuerySchema
>;

export const getBatchActivityAnalyticsResponseSchema = z.object({
  items: z.record(z.string(), getActivityAnalyticsResponseSchema),
});

export type GetBatchActivityAnalyticsResponseDTO = z.infer<
  typeof getBatchActivityAnalyticsResponseSchema
>;
