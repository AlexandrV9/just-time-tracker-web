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
