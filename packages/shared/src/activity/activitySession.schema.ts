import z from "zod";

export const activitySessionStatusSchema = z.enum([
  "active",
  "paused",
  "finished",
]);

export type ActivitySessionStatusDTO = z.infer<
  typeof activitySessionStatusSchema
>;

export const activitySessionSchema = z.object({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  activityId: z.string().min(1),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable(),
  status: activitySessionStatusSchema,
  activeDurationMs: z.number().int().nonnegative(),
  pauseDurationMs: z.number().int().nonnegative(),
  currentSegmentId: z.string().nullable(),
});

export type ActivitySessionDTO = z.infer<typeof activitySessionSchema>;

export const createActivitySessionSchema = z.object({
  activityId: z.string().min(1),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable().optional(),
  status: activitySessionStatusSchema.optional(),
  activeDurationMs: z.number().int().nonnegative().optional(),
  pauseDurationMs: z.number().int().nonnegative().optional(),
});

export type CreateActivitySessionDataDTO = z.infer<
  typeof createActivitySessionSchema
>;

export const updateActivitySessionSchema = z.object({
  id: z.string().min(1),
  activityId: z.string().min(1).optional(),
  startedAt: z.iso.datetime().optional(),
  endedAt: z.iso.datetime().nullable().optional(),
  status: activitySessionStatusSchema.optional(),
  activeDurationMs: z.number().int().nonnegative().optional(),
  pauseDurationMs: z.number().int().nonnegative().optional(),
});

export type UpdateActivitySessionDataDTO = z.infer<
  typeof updateActivitySessionSchema
>;
