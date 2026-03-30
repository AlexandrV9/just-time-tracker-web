import type { CalendarEventDTO } from "@to-do-list/shared";

export const mockCalendarEvents: CalendarEventDTO[] = [
  {
    id: "1",
    title: "Дизайн созвон",
    startDate: "2026-01-18T09:30:00",
    endDate: "2026-01-18T10:30:00",
    createdById: "user-1",
    createdAt: "2026-01-01T10:00:00",
    updatedAt: null,
  },
  {
    id: "2",
    title: "Разработка фичи",
    startDate: "2026-01-18T11:00:00",
    endDate: "2026-01-18T14:20:00",
    createdById: "user-1",
    createdAt: "2026-01-01T10:00:00",
    updatedAt: null,
  },
];
