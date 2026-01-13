import z from "zod";
import { baseIdSchema, paginationResponseSchema } from "../common/index.js";
import { tagSchema } from "../tag/tag.schema.js";

export const timeEntryBaseSchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  description: z.string().max(1000).optional(),
  startDate: z.iso.datetime().nullable(),
  endDate: z.iso.datetime().nullable(),
  createdById: z.string().min(1, "createdById is required"),
  tags: z.array(tagSchema).max(10).optional(),
  showInCalendar: z.boolean().default(false),
});

export const createTimeEntrySchema = timeEntryBaseSchema.superRefine(
  (data, ctx) => {
    const { startDate, endDate, showInCalendar } = data;

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

    if (showInCalendar && !startDate) {
      ctx.addIssue({
        path: ["showInCalendar"],
        message: "startDate is required to show entry in calendar",
        code: "custom",
      });
    }
  }
);

export const timeEntrySchema = timeEntryBaseSchema.extend({
  id: z.string().min(1, "id is required"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
});

export const updateTimeEntrySchema = z
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

export const getTimeEntriesQuerySchema = z
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

export const timeEntryIdSchema = baseIdSchema;

export const timeEntriesSchema = paginationResponseSchema(timeEntrySchema);

export type TimeEntryDTO = z.infer<typeof timeEntrySchema>;

export type CreateTimeEntryDataDTO = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryDataDTO = z.infer<typeof updateTimeEntrySchema>;
export type DeleteTimeEntryDataDTO = z.infer<typeof timeEntryIdSchema>;
export type GetTimeEntriesQueryDTO = z.infer<typeof getTimeEntriesQuerySchema>;
export type GetTimeEntryDataDTO = z.infer<typeof baseIdSchema>;
export type GetTimeEntriesResponseDTO = z.infer<typeof timeEntriesSchema>;
