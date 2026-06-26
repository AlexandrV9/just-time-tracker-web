import z from "zod";

export const DEFAULT_ACTIVITY_SETTINGS = {
  sessionGoalSeconds: 5400,
  notifyOnGoalReached: false,
  notifyOnLongPause: false,
  longPauseThresholdSeconds: 1800,
  notifyOnLongActivity: false,
  longActivityThresholdSeconds: 1800,
} as const;

export const activitySettingsSchema = z.object({
  sessionGoalSeconds: z.number().int().positive(),
  notifyOnGoalReached: z.boolean(),
  notifyOnLongPause: z.boolean(),
  longPauseThresholdSeconds: z.number().int().positive(),
  notifyOnLongActivity: z.boolean(),
  longActivityThresholdSeconds: z.number().int().positive(),
});

export type ActivitySettingsDTO = z.infer<typeof activitySettingsSchema>;

export const updateActivitySettingsBodySchema = activitySettingsSchema;

export const updateActivitySettingsParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
  ...activitySettingsSchema.shape,
});

export type UpdateActivitySettingsDTO = z.infer<
  typeof updateActivitySettingsParamsSchema
>;
