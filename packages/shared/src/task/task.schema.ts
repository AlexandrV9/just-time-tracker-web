import z from "zod";
import { tagSchema } from "../tag/index.js";

// ********************** TaskStatusDTO ***********************

export const taskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "done",
  "review",
  "archived",
  "blocked",
]);

export type TaskStatusDTO = z.infer<typeof taskStatusSchema>;

//

//

// ********************** TaskPriorityDTO ***********************

export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export type TaskPriorityDTO = z.infer<typeof taskPrioritySchema>;

//

//

// *********************** TaskBase ***************************

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

//

//

// *********************** CreateTaskDataDTO ***************************

export const createTaskSchema = taskBaseSchema.extend({
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional().nullable(),
});

export type CreateTaskDataDTO = z.infer<typeof createTaskSchema>;

//

//

// *********************** UpdateTaskDataDTO ***************************

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

export type UpdateTaskDataDTO = z.infer<typeof updateTaskSchema>;

//

//

// *********************** TaskIdDTO ***************************

export const taskIdSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export type TaskIdDTO = z.infer<typeof taskIdSchema>;
export type GetTaskDataDTO = TaskIdDTO;
export type DeleteTaskDataDTO = TaskIdDTO;

//

//

// *********************** TaskDTO ***************************

export const taskSchema = z.object({
  ...taskIdSchema.shape,
  ...taskBaseSchema.shape,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
  isDeleting: z.boolean().default(false),
});

export type TaskDTO = z.infer<typeof taskSchema>;

//

//

// *********************** PaginationDTO ***************************

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type PaginationDTO = z.infer<typeof paginationSchema>;

//

//

// *********************** TasksResponseDTO ***************************

export const tasksResponseSchema = z.object({
  data: z.array(taskSchema),
  pagination: paginationSchema,
});

export type TasksResponseDTO = z.infer<typeof tasksResponseSchema>;
export type GetTasksResponseDTO = TasksResponseDTO;

//

//

// *********************** GetTasksQueryDTO ***************************

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

export type GetTasksQueryDTO = z.infer<typeof getTasksQuerySchema>;

// *********************** GetFreeSlotsQueryDTO ***************************

export const getFreeSlotsSchema = z.object({
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  excludeTaskIds: z.array(z.string()).optional(),
});

export type GetFreeSlotsQueryDTO = z.infer<typeof getFreeSlotsSchema>;

export type TimeSlotDTO = {
  startDate: string;
  endDate: string;
};

// *********************** GetFreeSlotsQueryDTO ***************************

export const getTasksCountSchema = z.object({
  fromDate: z.iso.datetime(),
  toDate: z.iso.datetime(),
});

export type GetTasksCountQueryDTO = z.infer<typeof getTasksCountSchema>;
export type GetTasksCountResponseDTO = { count: number };
