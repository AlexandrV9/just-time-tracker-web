import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useMemo, type ReactNode } from "react";

import { CalendarContext, type CalendarContextValue } from "./context";

type CalendarProviderProps = {
  children: ReactNode;
  month: Dayjs;
  setMonth: React.Dispatch<React.SetStateAction<Dayjs>>;
  date: Dayjs | null;
  minDate: Dayjs | null;
  maxDate: Dayjs | null;
};

export const CalendarProvider = ({
  children,
  month,
  setMonth,
  minDate,
  maxDate,
}: CalendarProviderProps) => {
  const goToPrevMonth = useCallback(() => {
    setMonth((prev) => prev.subtract(1, "month"));
  }, [setMonth]);

  const goToNextMonth = useCallback(() => {
    setMonth((prev) => prev.add(1, "month"));
  }, [setMonth]);

  const goToMonth = useCallback(
    (targetMonth: Dayjs) => {
      setMonth(targetMonth);
    },
    [setMonth],
  );

  const _minDate = useMemo(() => (minDate ? dayjs(minDate) : null), [minDate]);
  const _maxDate = useMemo(() => (maxDate ? dayjs(maxDate) : null), [maxDate]);

  const isDateDisabled = useCallback(
    (date: Dayjs) => {
      if (_minDate && date.isBefore(_minDate, "day")) return true;
      if (_maxDate && date.isAfter(_maxDate, "day")) return true;

      return false;
    },
    [_minDate, _maxDate],
  );

  const isToday = useCallback((date: Dayjs) => date.isSame(dayjs(), "day"), []);

  const value: CalendarContextValue = useMemo(() => {
    const dateOptions = {
      minDate,
      maxDate,
      isDateDisabled,
      isToday,
    };

    const monthOptions = {
      month,
      goToPrevMonth,
      goToNextMonth,
      goToMonth,
    };

    return {
      ...dateOptions,
      ...monthOptions,
    };
  }, [
    minDate,
    maxDate,
    isDateDisabled,
    isToday,
    month,
    goToPrevMonth,
    goToNextMonth,
    goToMonth,
  ]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
