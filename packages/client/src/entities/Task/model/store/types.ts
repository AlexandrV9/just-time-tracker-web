import type { Task } from "~/shared/api/services/task";

export type LocalCreateTaskData = Omit<
  Task,
  "id" | "localId" | "createdAt" | "updatedAt" | "syncStatus"
>;

export type LocalUpdateTaskData = Partial<Task> & Pick<Task, "localId">;

export type LocalDeleteTaskData = Pick<Task, "localId"> &
  Partial<Pick<Task, "id" | "syncStatus">>;
