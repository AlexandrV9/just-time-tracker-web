import { endOfDay, parseISO, startOfDay } from "date-fns";
import type { CalendarDay } from "./types";

/**
 * Преобразует календарную дату в интервал даты
 * @example
 * getDateIntervalByCalendarDay("2021-01-01") // { fromDate: "2021-01-01T00:00:00.000Z", toDate: "2021-01-01T23:59:59.999Z" }
 */
export const getDateIntervalByCalendarDay = (calendarDay: CalendarDay) => {
  const date = parseISO(calendarDay);
  return {
    fromDate: startOfDay(date).toISOString(),
    toDate: endOfDay(date).toISOString(),
  };
};
