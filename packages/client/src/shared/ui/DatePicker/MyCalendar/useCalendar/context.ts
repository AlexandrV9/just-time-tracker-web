import { createContext } from "react";
import type { Dayjs } from "dayjs";

export type CalendarContextValue = {
  minDate: Dayjs | null;
  maxDate: Dayjs | null;
  isToday: (date: Dayjs) => boolean;
  isDateDisabled: (date: Dayjs) => boolean;
  month: Dayjs;
  goToMonth: (targetMonth: Dayjs) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
};

export const CalendarContext = createContext<CalendarContextValue | null>(
  null,
);
