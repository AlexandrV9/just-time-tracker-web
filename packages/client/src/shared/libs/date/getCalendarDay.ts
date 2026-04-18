import { format } from "date-fns";
import type { CalendarDay } from "./types";

export const getCalendarDay = (date: Date = new Date()): CalendarDay => {
  return format(date, "yyyy-MM-dd") as CalendarDay;
};
