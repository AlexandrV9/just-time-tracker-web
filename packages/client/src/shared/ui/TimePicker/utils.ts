import type { Dayjs } from "dayjs";
import type { TimeObject } from "./types";
import dayjs from "dayjs";

export const convertTimeStringToTimeObject = (
  timeStr: string,
  options?: { separator?: string }
): TimeObject => {
  const { separator = ":" } = options || {};

  const [hours = 0, minutes = 0, seconds = 0] = timeStr
    .split(separator)
    .map(Number);

  return {
    hours,
    minutes,
    seconds,
  };
};

export const convertTimeObjectToTimeString = (
  timeObj: TimeObject,
  options?: { separator?: string }
): string => {
  const { separator = ":" } = options || {};

  const { hours, minutes, seconds } = timeObj;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(separator);
};

export const convertDayjsDateToTimeObject = (date: Dayjs): TimeObject => {
  return {
    hours: date.hour(),
    minutes: date.minute(),
    seconds: date.second(),
  };
};

export const isDayjs = (date: unknown): date is Dayjs => {
  return dayjs.isDayjs(date);
};

export const applyTimeObjectToDayjsDate = (
  timeObj: TimeObject,
  date?: Dayjs | Date
): Dayjs => {
  const { hours, minutes, seconds } = timeObj;

  const dateInstance = isDayjs(date) ? date : dayjs(date ?? null);

  return dateInstance
    .set("hour", hours)
    .set("minute", minutes)
    .set("second", seconds);
};

export const convertDayjsDateToDate = (dayjsDate: Dayjs): Date => {
  return dayjsDate.toDate();
};
