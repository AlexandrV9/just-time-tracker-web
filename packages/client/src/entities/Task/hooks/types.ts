import type { Task } from "~/shared/api/services/task";

export type UpdateTaskData = Partial<Task> & Pick<Task, "localId">;

export type DeleteTaskData = Pick<Task, "id" | "localId">;
