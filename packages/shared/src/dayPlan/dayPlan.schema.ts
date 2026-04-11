import z from "zod";
import { baseIdSchema, paginationResponseSchema } from "../common/index.js";

const ymdDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

export const dayPlanSchema = z.object({
  id: z.string().min(1, "id is required"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  createdById: z.string().min(1, "createdById is required"),
  date: ymdDateString,
});

export type DayPlanDTO = z.infer<typeof dayPlanSchema>;

export const createDayPlanSchema = z.object({
  createdById: z.string().min(1, "createdById is required"),
  date: ymdDateString,
});

export type CreateDayPlanDataDTO = z.infer<typeof createDayPlanSchema>;

export const updateDayPlanSchema = z.object({
  id: z.string().min(1, "id is required"),
  date: ymdDateString.optional(),
});

export type UpdateDayPlanDataDTO = z.infer<typeof updateDayPlanSchema>;

export const getDayPlansSchema = z.object({
  createdById: z.string().optional(),
  date: ymdDateString.optional(),
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "date"]).default("date").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type GetDayPlansDTO = z.infer<typeof getDayPlansSchema>;

export const deleteDayPlanSchema = baseIdSchema;

export type DeleteDayPlanDataDTO = z.infer<typeof deleteDayPlanSchema>;

export type GetDayPlanDTO = z.infer<typeof baseIdSchema>;

export const getDayPlansResponseSchema = paginationResponseSchema(dayPlanSchema);
export type GetDayPlansResponseDTO = z.infer<typeof getDayPlansResponseSchema>;
