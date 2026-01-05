import type { Dayjs } from "dayjs";

export const getSunday = (date: Dayjs) => {
  const dayOfWeek = date.day();

  return date.subtract(dayOfWeek, "day").startOf("day");
};

export const getWeekDays = (sunday: Dayjs) =>
  Array.from({ length: 7 }, (_, i) => sunday.add(i, "day"));

export const getWeekdayLabel = (date: Dayjs) => date.format("dd");
