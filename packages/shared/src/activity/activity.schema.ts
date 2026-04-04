import z from "zod";
import { baseIdSchema, paginationResponseSchema } from "../common/index.js";

const tagListSchema = z.array(z.string()).max(10).optional();

export const createActivitySchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  description: z.string().max(1000).optional(),
  createdById: z.string().min(1, "createdById is required"),
  tags: tagListSchema,
});

export type CreateActivityDataDTO = z.infer<typeof createActivitySchema>;

export const activityStatusSchema = z.enum(["idle", "active", "paused"]);

export const activitySchema = z.object({
  id: z.string().min(1, "id is required"),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  createdById: z.string(),
  tags: z.array(z.string()),
  status: activityStatusSchema, // возможно убрать в будущем
  currentActivitySessionId: z.string().nullable(),
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

export const stopActivity = z.object({
  activityId: z.string().min(1, "activityId is required"),
});

export type StopActivityDTO = z.infer<typeof stopActivity>;

export const activitiesSchema = paginationResponseSchema(activitySchema);

export type GetActivitiesResponseDTO = z.infer<typeof activitiesSchema>;

export const getActivitySession = z.object({
  id: z.string().min(1, "Id is required"),
});

export type GetActivitySessionDTO = z.infer<typeof getActivitySession>;
