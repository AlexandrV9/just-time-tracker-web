import z from "zod";

export const activitySessionStatusSchema = z.enum([
  "active",
  "paused",
  "finished",
]);

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
  lastHeartbeatAt: z.iso.datetime().optional(), // последний момент, когда мы уверены, что пользователь работал в рамках ЭТОЙ конкретной сессии
});

export type ActivitySessionDTO = z.infer<typeof activitySessionSchema>;
