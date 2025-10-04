import dayjs from "dayjs";

export type isDateDisabledProps = {
  date: { year: number; month: number; day: number };
  minDate?: null | Date;
  maxDate?: null | Date;
};

export const isDateDisabled = ({
  date,
  minDate,
  maxDate,
}: isDateDisabledProps) => {
  const _date = new Date(date.year, date.month - 1, date.day);

  if (minDate && dayjs(_date).isBefore(minDate, "day")) {
    return true; // Дата раньше minDate
  }

  if (maxDate && dayjs(_date).isAfter(maxDate, "day")) {
    return true; // Дата позже maxDate
  }

  return false;
};
