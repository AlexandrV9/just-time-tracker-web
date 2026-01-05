import type {
  CreateTaskDataDTO,
  DeleteTaskDataDTO,
  GetFreeSlotsQueryDTO,
  GetTaskDataDTO,
  GetTasksCountQueryDTO,
  GetTasksCountResponseDTO,
  GetTasksQueryDTO,
  GetTasksResponseDTO,
  TaskDTO,
  TimeSlotDTO,
  UpdateTaskDataDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";
import type { RequestResponse } from "../types";

export class TaskService {
  getTaskById({
    id: taskId,
  }: GetTaskDataDTO): Promise<RequestResponse<TaskDTO, unknown>> {
    return baseApi.get<TaskDTO>(`/api/tasks/${taskId}`);
  }

  getTasks(data?: GetTasksQueryDTO) {
    return baseApi.get<GetTasksResponseDTO>(`/api/tasks`, { params: data });
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

  getFreeSlots(data: GetFreeSlotsQueryDTO) {
    return baseApi.post<TimeSlotDTO[]>(`/api/tasks/free-slots`, { data });
  }

  getTasksCount(data?: GetTasksCountQueryDTO) {
    return baseApi.get<GetTasksCountResponseDTO>(`/api/tasks/count`, {
      params: data,
    });
  }
}

export const taskApiService = new TaskService();

export * from "./models";
