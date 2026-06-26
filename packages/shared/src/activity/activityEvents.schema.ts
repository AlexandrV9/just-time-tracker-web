import z from "zod";
import { activitySchema } from "./activity.schema.js";
import { activitySessionSchema } from "./activitySession.schema.js";
import { activitySessionSegmentSchema } from "./activitySessionSegment.schema.js";

export const activityTrackingEventTypeSchema = z.enum([
  "started",
  "paused",
  "finished",
]);

export type ActivityTrackingEventTypeDTO = z.infer<
  typeof activityTrackingEventTypeSchema
>;

export const activityTrackingEventDataSchema = z.object({
  activity: activitySchema,
  session: activitySessionSchema,
  segment: activitySessionSegmentSchema.nullable(),
});

export const activityTrackingEventSchema = z.object({
  type: activityTrackingEventTypeSchema,
  clientId: z.string().optional(),
  data: activityTrackingEventDataSchema,
});

export type ActivityTrackingEventDTO = z.infer<
  typeof activityTrackingEventSchema
>;

export const NOTIFICATION_JOB_TYPES = {
  ACTIVITY_GOAL_REACHED: "activity_goal_reached",
  ACTIVITY_LONG_PAUSE: "activity_long_pause",
  ACTIVITY_LONG_ACTIVITY: "activity_long_activity",
} as const;

export const notificationJobTypeSchema = z.enum([
  NOTIFICATION_JOB_TYPES.ACTIVITY_GOAL_REACHED,
  NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_PAUSE,
  NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_ACTIVITY,
]);

export type NotificationJobTypeDTO = z.infer<typeof notificationJobTypeSchema>;

export const activityReminderEventSchema = z.object({
  type: z.literal("reminder"),
  data: z.object({
    jobId: z.string().min(1),
    reminderType: notificationJobTypeSchema,
    activityId: z.string().nullable(),
    title: z.string(),
    body: z.string(),
  }),
});

export type ActivityReminderEventDTO = z.infer<
  typeof activityReminderEventSchema
>;

export const activityStreamEventSchema = z.discriminatedUnion("type", [
  activityTrackingEventSchema,
  activityReminderEventSchema,
]);

export type ActivityStreamEventDTO = z.infer<typeof activityStreamEventSchema>;
