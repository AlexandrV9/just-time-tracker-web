import { format } from "date-fns";

export function getLocalCalendarDayKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}
