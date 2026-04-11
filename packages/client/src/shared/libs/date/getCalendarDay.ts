import { format } from "date-fns";
import type { CalendarDay } from "./types";

export const getLocalCalendarDay = (date: Date = new Date()): CalendarDay => {
  return format(date, "yyyy-MM-dd") as CalendarDay;
};
