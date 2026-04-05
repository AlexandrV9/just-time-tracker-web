import z from "zod";

export const activitySessionSegmentTypeSchema = z.enum(["active", "pause"]);

export const activitySessionSegmentSchema = z.object({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  sessionId: z.string().min(1),
  type: activitySessionSegmentTypeSchema,
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable(),
});

export type ActivitySessionSegmentDTO = z.infer<
  typeof activitySessionSegmentSchema
>;

export const getActivitySessionSegmentSchema = z.object({
  segmentId: z.string().min(1, "segmentId is required"),
});

export type GetActivitySessionSegmentDTO = z.infer<
  typeof getActivitySessionSegmentSchema
>;
