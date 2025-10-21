export type TaskDTO = {
  id: string;
  title: string;
  description?: string;
  //   status: TaskStatus;
  //   priority: TaskPriority;

  createdAt: string; // Дата создания задачи
  updatedAt: string; // Дата обновления задачи (При создании updatedAt = createdAt)

  startDate?: null | string; // Когда начинать выполнение
  endDate?: null | string; // Крайний срок выполнения
  //   actualStartDate?: null | string; // Когда фактически начали
  //   actualEndDate?: null | string; // Когда фактически закончили

  //   createdById: string; // Id пользователь кто создал задачу
  //   assignedById?: string; // Id пользователь кто назначил испольнителя
  //   assignedToId?: string; // Id пользователя кому назначен задача (Исполнитель)

  //   projectId?: string;
  //   tags?: string[];
  //   estimatedTime?: number; // сколько потребуется времени для выполнения задачи (Планируемое время)
  //   actualTime?: number; // сколько времени затраченно по факту (Фактическое время)
};
