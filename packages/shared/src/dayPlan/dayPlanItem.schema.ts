import z from "zod";
import { baseIdSchema, paginationResponseSchema } from "../common/index.js";

export const dayPlanItemSchema = z.object({
  id: z.string().min(1, "id is required"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  dayPlanId: z.string().min(1, "dayPlanId is required"),
  activityId: z.string().min(1, "activityId is required"),
});

export type DayPlanItemDTO = z.infer<typeof dayPlanItemSchema>;

export const createDayPlanItemSchema = z.object({
  dayPlanId: z.string().min(1, "dayPlanId is required"),
  activityId: z.string().min(1, "activityId is required"),
});

export type CreateDayPlanItemDataDTO = z.infer<typeof createDayPlanItemSchema>;

export const updateDayPlanItemSchema = z.object({
  id: z.string().min(1, "id is required"),
  activityId: z.string().min(1, "activityId is required").optional(),
});

export type UpdateDayPlanItemDataDTO = z.infer<typeof updateDayPlanItemSchema>;

export const getDayPlanItemsSchema = z.object({
  dayPlanId: z.string().optional(),
  activityId: z.string().optional(),
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type GetDayPlanItemsDTO = z.infer<typeof getDayPlanItemsSchema>;

export const deleteDayPlanItemSchema = baseIdSchema;

export type DeleteDayPlanItemDataDTO = z.infer<typeof deleteDayPlanItemSchema>;

export type GetDayPlanItemDTO = z.infer<typeof baseIdSchema>;

export const getDayPlanItemsResponseSchema =
  paginationResponseSchema(dayPlanItemSchema);
export type GetDayPlanItemsResponseDTO = z.infer<
  typeof getDayPlanItemsResponseSchema
>;

export const addDayPlanItemsSchema = z.object({
  dayPlanId: z.string().min(1, "dayPlanId is required"),
  activityIds: z.array(z.string().min(1, "activityId is required")),
});

export type AddDayPlanItemsDataDTO = z.infer<typeof addDayPlanItemsSchema>;
