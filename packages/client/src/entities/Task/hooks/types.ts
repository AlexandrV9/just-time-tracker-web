import type { Task } from "~/shared/api/services/task";

export type CreateTaskData = Omit<
  Task,
  "id" | "localId" | "createdAt" | "updatedAt" | "syncStatus"
>;

export type UpdateTaskData = Partial<Task> & Pick<Task, "localId">;

export type DeleteTaskData = Task;
