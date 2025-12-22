import type {
  CreateTaskDataDTO,
  DeleteTaskDataDTO,
  TaskDTO,
  UpdateTaskDataDTO,
} from "@to-do-list/shared";
import { taskQueries } from "./task.queries.js";

const getTaskById = async (id: string): Promise<TaskDTO | null> => {
  const task = await taskQueries.getTaskById(id);

  if (!task) return null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status as any,
    priority: task.priority as any,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    startDate: task.startDate,
    endDate: task.endDate,
    actualStartDate: task.actualStartDate,
    actualEndDate: task.actualEndDate,
    createdById: task.createdById,
    tags:
      task.tags?.map((tag: any) => ({ id: tag, title: tag, label: tag })) || [],
    isDeleting: task.isDeleting,
  };
};

const createTask = async (data: CreateTaskDataDTO): Promise<TaskDTO> => {
  const task = await taskQueries.createTask(data);

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status as any,
    priority: task.priority as any,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    startDate: task.startDate,
    endDate: task.endDate,
    actualStartDate: task.actualStartDate,
    actualEndDate: task.actualEndDate,
    createdById: task.createdById,
    tags: task.tags?.map((tag) => ({ id: tag, title: tag, label: tag })) || [],
    isDeleting: task.isDeleting,
  };
};

const updateTask = async (data: UpdateTaskDataDTO): Promise<TaskDTO> => {
  const task = await taskQueries.updateTask(data);

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status as any,
    priority: task.priority as any,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    startDate: task.startDate,
    endDate: task.endDate,
    actualStartDate: task.actualStartDate,
    actualEndDate: task.actualEndDate,
    createdById: task.createdById,
    tags: task.tags?.map((tag) => ({ id: tag, title: tag, label: tag })) || [],
    isDeleting: task.isDeleting,
  };
};

const deleteTask = async (data: DeleteTaskDataDTO): Promise<boolean> => {
  try {
    const task = await taskQueries.hardDeleteTask(data.id);

    return true;
  } catch {
    return false;
  }
};

export const taskRepository = {
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
