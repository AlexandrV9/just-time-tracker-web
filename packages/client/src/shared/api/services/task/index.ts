import type {
  CreateTaskDataDTO,
  DeleteTaskDataDTO,
  GetTaskDataDTO,
  TaskDTO,
  UpdateTaskDataDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";

export class TaskService {
  getTaskById({ id: taskId }: GetTaskDataDTO) {
    return baseApi.get<TaskDTO>(`/api/tasks/${taskId}`);
  }

  getTasks() {
    return baseApi.get<TaskDTO[]>(`/api/tasks`);
  }

  createTask(data: CreateTaskDataDTO) {
    return baseApi.post<TaskDTO>(`/api/tasks`, { data });
  }

  updateTask(data: UpdateTaskDataDTO) {
    return baseApi.patch<TaskDTO>(`/api/tasks`, { data });
  }

  deleteTask(data: DeleteTaskDataDTO) {
    return baseApi.delete<boolean>(`/api/tasks/${data.id}`);
  }
}

export const taskApiService = new TaskService();

export * from "./models";
