import { zValidator } from "@hono/zod-validator";
import { validationUtils } from "../shared/index.js";

import { tasksService } from "./task.service.js";
import {
  createTaskSchema,
  getTasksQuerySchema,
  taskIdSchema,
  updateTaskSchema,
} from "@to-do-list/shared";

const createHandler = (
  schema: { type: "json" | "param" | "query"; validator: any },
  serviceMethod: Function,
  successStatus = 200
) =>
  zValidator(schema.type, schema.validator, async (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          data: validationUtils.formatZodErrors(result.error.message),
          message: "Validation failed",
        },
        400
      );
    }

    try {
      const responseData = await serviceMethod(result.data);

      let statusCode = successStatus;

      if (!responseData.success) {
        statusCode = responseData.error?.code === "NOT_FOUND" ? 404 : 400;
      }

      return c.json(responseData, statusCode as any);
    } catch (error) {
      console.error("Handler error:", error);

      return c.json(
        {
          success: false,
          message: "Internal server error",
        },
        500
      );
    }
  });

const getTaskById = createHandler(
  { type: "param", validator: taskIdSchema },
  tasksService.getTaskById
);

const getTasks = createHandler(
  { type: "query", validator: getTasksQuerySchema },
  tasksService.getTasks
);

const createTask = createHandler(
  { type: "json", validator: createTaskSchema },
  tasksService.createTask,
  201
);

const updateTask = createHandler(
  { type: "json", validator: updateTaskSchema },
  tasksService.updateTask
);

const deleteTask = createHandler(
  { type: "param", validator: taskIdSchema },
  tasksService.deleteTask
);

export const tasksHandlers = {
  getTaskById,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
