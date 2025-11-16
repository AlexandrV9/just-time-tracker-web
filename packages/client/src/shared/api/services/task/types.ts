export type TaskStatusDTO =
  | "todo"
  | "in_progress"
  | "done"
  | "review"
  | "archived"
  | "blocked";

export type TaskPriorityDTO = "low" | "medium" | "high" | "urgent";

export type TagDTO = {
  id: string;
  title: string;
  label: string;
};

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

export type CreateTaskDataDTO = Omit<TaskDTO, "id">;

export type UpdateTaskDataDTO = Partial<TaskDTO> & Pick<TaskDTO, "id">;

export type DeleteTaskDataDTO = Pick<TaskDTO, "localId" | "id">;
