import type { Task } from "./types";

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Разработать интерфейс задачи",
    description:
      "Создать компоненты для отображения и редактирования задач в соответствии с макетом Figma",
    status: "in_progress",
    priority: "high",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    createdById: "user-456",
    projectId: "project-789",
    tags: ["ui", "frontend", "component"],
    estimatedTime: 240, // 4 часа
    actualTime: 120, // 2 часа
    startDate: "2024-01-16T09:15:00Z",
  },
  {
    id: "task-2",
    title: "Написать тесты для API задач",
    description:
      "Добавить unit и integration тесты для эндпоинтов работы с задачами",
    status: "todo",
    priority: "medium",
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-16T09:15:00Z",
    createdById: "user-789",
    projectId: "project-789",
    tags: ["backend", "testing", "api"],
    estimatedTime: 180, // 3 часа
    actualTime: 0,
    startDate: "2024-01-16T09:15:00Z",
  },
  {
    id: "task-3",
    title: "Исправить баг с отображением дат",
    description:
      "В мобильной версии даты задач отображаются некорректно на iOS устройствах",
    status: "review",
    priority: "urgent",
    createdAt: "2024-01-14T16:45:00Z",
    updatedAt: "2024-01-17T11:20:00Z",
    createdById: "user-456",
    projectId: "project-123",
    tags: ["bug", "mobile", "ios"],
    estimatedTime: 60, // 1 час
    actualTime: 45, // 45 минут
    startDate: "2024-01-16T09:15:00Z",
  },
  {
    id: "task-4",
    title: "Добавить фильтрацию задач по тегам",
    description:
      "Реализовать функционал фильтрации задач по выбранным тегам в боковой панели",
    status: "done",
    priority: "low",
    createdAt: "2024-01-10T13:20:00Z",
    updatedAt: "2024-01-15T16:30:00Z",
    createdById: "user-456",
    projectId: "project-789",
    tags: ["feature", "filter", "ui"],
    estimatedTime: 120, // 2 часа
    actualTime: 150, // 2.5 часа
  },
  
];
