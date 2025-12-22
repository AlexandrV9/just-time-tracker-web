import type { TaskDTO } from "@to-do-list/shared";

export type TaskSyncStatus =
  | "pending" // Ожидает синхронизации
  | "syncing" // В процессе синхронизации
  | "synced" // Успешно синхронизировано
  | "error"; // Ошибка синхронизации

export interface Task extends TaskDTO {
  // /**
  //  * Статус сихронизации
  //  */
  // syncStatus: TaskSyncStatus;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changedById: string;
  changedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentCommentId?: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  filename: string;
  url: string;
  uploadedById: string;
  uploadedAt: Date;
  size: number;
  type: string;
}
