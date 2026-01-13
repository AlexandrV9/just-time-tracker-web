import z from "zod";
import { tagSchema } from "../tag/index.js";
import { baseIdSchema, paginationResponseSchema } from "../common/index.js";

export const taskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "done",
  "review",
  "archived",
  "blocked",
]);

export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const taskBaseSchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  description: z.string().max(1000).optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  startDate: z.iso.datetime().optional().nullable(),
  endDate: z.iso.datetime().optional().nullable(),
  actualStartDate: z.iso.datetime().optional().nullable(),
  actualEndDate: z.iso.datetime().optional().nullable(),
  createdById: z.string().min(1, "createdById is required"),
  tags: z.array(tagSchema).max(10).optional(),
});

export const createTaskSchema = taskBaseSchema.extend({
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional().nullable(),
});

export const updateTaskSchema = z.object({
  id: z.string().min(1, "id is required"),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  updatedAt: z.iso.datetime().optional().nullable(),
  startDate: z.iso.datetime().optional().nullable(),
  endDate: z.iso.datetime().optional().nullable(),
  actualStartDate: z.iso.datetime().optional().nullable(),
  actualEndDate: z.iso.datetime().optional().nullable(),
  tags: z.array(tagSchema).optional(),
  isDeleting: z.boolean().optional(),
});

export const taskSchema = z.object({
  ...baseIdSchema.shape,
  ...taskBaseSchema.shape,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
  isDeleting: z.boolean().default(false),
});

export const getTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  createdById: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(50).default(10).optional(),
  fromDate: z.iso.datetime().optional(),
  toDate: z.iso.datetime().optional(),
  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "title",
      "priority",
      "status",
      "startDate",
      "endDate",
    ])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export const tasksResponseSchema = paginationResponseSchema(taskSchema);

export const getFreeSlotsSchema = z.object({
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  excludeTaskIds: z.array(z.string()).optional(),
});

export const getTasksCountSchema = z.object({
  fromDate: z.iso.datetime(),
  toDate: z.iso.datetime(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  createdById: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  search: z.string().optional(),
});

export const taskIdSchema = baseIdSchema;

export type TaskDTO = z.infer<typeof taskSchema>;
export type TaskStatusDTO = z.infer<typeof taskStatusSchema>;
export type TaskPriorityDTO = z.infer<typeof taskPrioritySchema>;

export type GetTasksQueryDTO = z.infer<typeof getTasksQuerySchema>;
export type GetTasksResponseDTO = z.infer<typeof tasksResponseSchema>;

export type GetTaskDataDTO = z.infer<typeof baseIdSchema>;
export type CreateTaskDataDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDataDTO = z.infer<typeof updateTaskSchema>;
export type DeleteTaskDataDTO = z.infer<typeof baseIdSchema>;

export type GetTasksCountQueryDTO = z.infer<typeof getTasksCountSchema>;
export type GetTasksCountResponseDTO = Record<string, number>;

export type GetFreeSlotsQueryDTO = z.infer<typeof getFreeSlotsSchema>;
