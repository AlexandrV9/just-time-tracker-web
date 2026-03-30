import z from "zod";
import { baseIdSchema, paginationResponseSchema } from "../common/index.js";
import { tagSchema } from "../tag/tag.schema.js";

export const calendarEventBaseSchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  description: z.string().max(1000).optional(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  createdById: z.string().min(1, "createdById is required"),
  tags: z.array(tagSchema).max(10).optional(),
});

export const createCalendarEventSchema = calendarEventBaseSchema.superRefine(
  (data, ctx) => {
    const { startDate, endDate } = data;

    if (endDate && !startDate) {
      ctx.addIssue({
        path: ["startDate"],
        message: "startDate is required when endDate is provided",
        code: "custom",
      });
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      ctx.addIssue({
        path: ["endDate"],
        message: "endDate must be after startDate",
        code: "custom",
      });
    }
  }
);

export const calendarEventSchema = calendarEventBaseSchema.extend({
  id: z.string().min(1, "id is required"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
});

export const updateCalendarEventSchema = z
  .object({
    id: z.string().min(1, "id is required"),
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    updatedAt: z.iso.datetime().optional().nullable(),
    startDate: z.iso.datetime().optional().nullable(),
    endDate: z.iso.datetime().optional().nullable(),
    tags: z.array(tagSchema).optional(),
  })
  .superRefine(({ startDate, endDate }, ctx) => {
    if (endDate && !startDate) {
      ctx.addIssue({
        path: ["startDate"],
        message: "startDate is required when endDate is provided",
        code: "custom",
      });
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      ctx.addIssue({
        path: ["endDate"],
        message: "endDate must be after startDate",
        code: "custom",
      });
    }
  });

export const getCalendarEventsQuerySchema = z
  .object({
    createdById: z.string().optional(),
    tags: z.array(tagSchema).optional(),
    search: z.string().optional(),
    page: z.number().int().positive().default(1).optional(),
    limit: z.number().int().positive().max(50).default(10).optional(),
    fromDate: z.iso.datetime().optional(),
    toDate: z.iso.datetime().optional(),
    sortBy: z
      .enum(["createdAt", "updatedAt", "title", "startDate", "endDate"])
      .default("startDate")
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

export const calendarEventIdSchema = baseIdSchema;

export const calendarEventsSchema = paginationResponseSchema(calendarEventSchema);

export type CalendarEventDTO = z.infer<typeof calendarEventSchema>;

export type CreateCalendarEventDataDTO = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventDataDTO = z.infer<typeof updateCalendarEventSchema>;
export type DeleteCalendarEventDataDTO = z.infer<typeof calendarEventIdSchema>;
export type GetCalendarEventsQueryDTO = z.infer<typeof getCalendarEventsQuerySchema>;
export type GetCalendarEventDataDTO = z.infer<typeof calendarEventIdSchema>;
export type GetCalendarEventsResponseDTO = z.infer<typeof calendarEventsSchema>;
