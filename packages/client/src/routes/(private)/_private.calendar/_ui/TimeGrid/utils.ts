import { getTotalSecondsFromDay } from "~/shared/libs";

export const MINUTES_IN_HOUR = 60;

export const getTop = (
  startDate: string,
  startHour: number,
  hourHeight: number,
) => {
  const minutesFromGridStart =
    getTotalSecondsFromDay(startDate) - startHour * 60;

  return (minutesFromGridStart / MINUTES_IN_HOUR) * hourHeight;
};

export const getHeight = (
  startDate: string,
  endDate: string,
  hourHeight: number,
) => {
  const durationMinutes =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000 / 60;

  return (durationMinutes / MINUTES_IN_HOUR) * hourHeight;
};
