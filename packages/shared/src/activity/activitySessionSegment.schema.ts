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

export const getActivitySessionSegmentsSchema = z
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

export type GetActivitySessionSegmentsQueryDTO = z.infer<
  typeof getActivitySessionSegmentsSchema
>;

/** Route params + query for `GET /activities/:id/session-segments`. */
export const getActivitySessionSegmentsByActivityIdParamsSchema = z
  .object({
    id: z.string().min(1, "Id is required"),
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

export type GetActivitySessionSegmentsByActivityIdParamsDTO = z.infer<
  typeof getActivitySessionSegmentsByActivityIdParamsSchema
>;

export type GetActivitySessionSegmentsDTO =
  GetActivitySessionSegmentsQueryDTO & {
    activityId: string;
  };

export const getActivitySessionSegmentsResponseSchema = z.object({
  segments: z.array(activitySessionSegmentSchema),
});

export type GetActivitySessionSegmentsResponseDTO = z.infer<
  typeof getActivitySessionSegmentsResponseSchema
>;
