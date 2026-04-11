import { endOfDay, parseISO, startOfDay } from "date-fns";
import type { CalendarDay } from "./types";

export const getDateIntervalByCalendarDay = (calendarDay: CalendarDay) => {
  const date = parseISO(calendarDay);
  return {
    fromDate: startOfDay(date).toISOString(),
    toDate: endOfDay(date).toISOString(),
  };
};
