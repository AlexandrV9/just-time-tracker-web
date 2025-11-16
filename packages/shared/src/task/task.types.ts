import z from "zod";
import { TagDTO } from "../tag/index.js";
import { taskPrioritySchema, taskStatusSchema } from "./task.schema.js";

export type TaskStatusDTO = z.infer<typeof taskStatusSchema>;

export type TaskPriorityDTO = z.infer<typeof taskPrioritySchema>;

export type TaskDTO = {
  /**
   * Серверный id задачи
   */
  id: string;
  /**
   * Клиентский id задачи
   */
  localId: string;
  /**
   * Название задачи
   */
  title: string;
  /**
   * Описание задачи
   */
  description?: string;
  /**
   * Статус задачи
   */
  status: TaskStatusDTO;
  /**
   * Приоритет задачи
   */
  priority: TaskPriorityDTO;
  /**
   * Дата создания задачи
   */
  createdAt: string;
  /**
   * Дата обновления задачи
   */
  updatedAt?: null | string;
  /**
   * Дата начала выполнения задачи
   */
  startDate?: null | string;
  /**
   * Дата завершения выполнения задачи
   */
  endDate?: null | string;
  /**
   * Фактическая дата начала выполнения задачи
   */
  actualStartDate?: null | string;
  /**
   * Фактическая дата завершения выполнения задачи
   */
  actualEndDate?: null | string;
  /**
   * Id создателя (автора) задачи
   */
  createdById: string;
  /**
   * Тэги задачи
   */
  tags?: TagDTO[];
  /**
   * Флаг процесса удаления (true когда запрос на удаление отправлен)
   */
  isDeleting?: boolean;

  // *****************************************************************************
  // assignedById?: string; // Id пользователь кто назначил испольнителя
  // assignedToId?: string; // Id пользователя кому назначен задача (Исполнитель)
  // projectId?: string;
  // tags?: string[];
  // estimatedTime?: number; // сколько потребуется времени для выполнения задачи (Планируемое время)
  // actualTime?: number; // сколько времени затраченно по факту (Фактическое время)
};

export type GetTaskDataDTO = Pick<TaskDTO, "id">;

export interface GetTasksQueryDTO {
  status?: TaskDTO["status"];
  priority?: TaskDTO["priority"];
  createdById?: string;
  tags?: TaskDTO["tags"][];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type CreateTaskDataDTO = Omit<TaskDTO, "id">;

export type UpdateTaskDataDTO = Partial<TaskDTO> & Pick<TaskDTO, "id">;

export type DeleteTaskDataDTO = Pick<TaskDTO, "id">;
