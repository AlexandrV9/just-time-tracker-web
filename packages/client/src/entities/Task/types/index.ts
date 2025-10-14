export type TaskStatus =
  | "todo"
  | "in_progress"
  | "done"
  | "review"
  | "archived"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;

  createdAt: string; // Дата создания задачи
  updatedAt: string; // Дата обновления задачи (При создании updatedAt = createdAt)

  startDate?: null | string; // Когда начинать выполнение
  endDate?: null | string; // Крайний срок выполнения
  actualStartDate?: null | string; // Когда фактически начали
  actualEndDate?: null | string; // Когда фактически закончили

  createdById: string; // Id пользователь кто создал задачу
  assignedById?: string; // Id пользователь кто назначил испольнителя
  assignedToId?: string; // Id пользователя кому назначен задача (Исполнитель)

  projectId?: string;
  tags?: string[];
  estimatedTime?: number; // сколько потребуется времени для выполнения задачи (Планируемое время)
  actualTime?: number; // сколько времени затраченно по факту (Фактическое время)
};

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
