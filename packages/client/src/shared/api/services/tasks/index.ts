import { axiosInstance } from "~/shared/config/axios";

export class TasksService {
  getTasks() {
    return axiosInstance.get(`/api/tasks`);
  }
  getTaskById(taskId: string) {
    return axiosInstance.get(`/api/tasks/${taskId}`);
  }
  createTask() {}
  deleteTask() {}
  updateTask() {}
}

export const tasksService = new TasksService();
