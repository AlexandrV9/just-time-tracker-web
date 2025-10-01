import dayjs, { Dayjs } from "dayjs";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type CalendarContext = {
  // date
  minDate: Dayjs | null;
  maxDate: Dayjs | null;
  isToday: (date: Dayjs) => boolean;
  isDateDisabled: (date: Dayjs) => boolean;

  // month
  month: Dayjs;
  goToMonth: (targetMonth: Dayjs) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
};

const CalendarContext = createContext<CalendarContext | null>(null);

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
    [setMonth]
  );

  const _minDate = useMemo(() => (minDate ? dayjs(minDate) : null), [minDate]);
  const _maxDate = useMemo(() => (maxDate ? dayjs(maxDate) : null), [maxDate]);

  const isDateDisabled = useCallback(
    (date: Dayjs) => {
      if (_minDate && date.isBefore(_minDate, "day")) return true;
      if (_maxDate && date.isAfter(_maxDate, "day")) return true;

      return false;
    },
    [_minDate, _maxDate]
  );

  const isToday = useCallback((date: Dayjs) => date.isSame(dayjs(), "day"), []);

  const value: CalendarContext = useMemo(() => {
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

export const useCalendar = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("CalendarProvider not found");
  }

  return context;
};
