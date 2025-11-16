import type {
  CreateTaskDataDTO,
  DeleteTaskDataDTO,
  GetTaskDataDTO,
  GetTasksQueryDTO,
  TaskDTO,
  TasksResponseDTO,
  UpdateTaskDataDTO,
} from "@to-do-list/shared";
import { taskRepository } from "./task.repository.js";
import type { ErrorResponse, SuccessResponse } from "src/shared/types.js";
import { taskQueries } from "./task.queries.js";

type CreateTaskResponse = SuccessResponse<TaskDTO> | ErrorResponse;

const createTask = async (
  data: CreateTaskDataDTO
): Promise<CreateTaskResponse> => {
  try {
    // Валидация бизнес-логики (если нужна)
    if (
      data.startDate &&
      data.endDate &&
      new Date(data.startDate) > new Date(data.endDate)
    ) {
      return {
        success: false,
        message: "Start date cannot be after end date",
        // error: {
        //   code: "VALIDATION_ERROR",
        //   details: { startDate: "Must be before end date" },
        // },
      };
    }

    const task = await taskRepository.createTask(data);

    return {
      success: true,
      data: task,
      message: "Task created successfully",
    };
  } catch (error) {
    console.error("Service error creating task:", error);

    return {
      success: false,
      message: "Failed to create task",
      // error: {
      //   code: "INTERNAL_ERROR",
      //   details: error,
      // },
    };
  }
};

type UpdateTaskResponse = SuccessResponse<TaskDTO> | ErrorResponse;

const updateTask = async (
  data: UpdateTaskDataDTO
): Promise<UpdateTaskResponse> => {
  try {
    const task = await taskRepository.updateTask(data);

    return {
      success: true,
      data: task,
    };
  } catch {
    return {
      success: false,
      message: "Failed to update task",
    };
  }
};

type DeleteTaskResponse = SuccessResponse<null> | ErrorResponse;

const deleteTask = async (
  data: DeleteTaskDataDTO
): Promise<DeleteTaskResponse> => {
  try {
    const task = await taskRepository.getTaskById(data.id);

    if (!task) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    await taskRepository.deleteTask(data);

    return {
      success: true,
      data: null,
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete task",
    };
  }
};

type GetTaskByIdResponse = SuccessResponse<TaskDTO> | ErrorResponse;

const getTaskById = async (
  data: GetTaskDataDTO
): Promise<GetTaskByIdResponse> => {
  try {
    const task = await taskRepository.getTaskById(data.id);

    if (!task) {
      return {
        success: false,
        message: "Task not found",
        // error: { code: "NOT_FOUND" },
      };
    }

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    console.error("Service error getting task:", error);

    return {
      success: false,
      message: "Failed to get task",
      // error: {
      //   code: "INTERNAL_ERROR",
      //   details: error,
      // },
    };
  }
};

type GetTasksResponse = SuccessResponse<TasksResponseDTO> | ErrorResponse;

const getTasks = async (
  filters: GetTasksQueryDTO
): Promise<GetTasksResponse> => {
  try {
    const result = await taskQueries.getTasks(filters);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error getting tasks:", error);

    return {
      success: false,
      message: "Failed to fetch tasks",
      // error: {
      //   code: "INTERNAL_ERROR",
      //   message: "Failed to fetch tasks",
      // },
    };
  }
};

export const tasksService = {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getTasks,
};
