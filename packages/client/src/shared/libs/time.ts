import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

export type TimeObject = {
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * @description Преобразует строку времени в объект времени TimeObject
 * @example
 * convertTimeStringToTimeObject("12:34:56") // { hours: 12, minutes: 34, seconds: 56 }
 * convertTimeStringToTimeObject("12.34.56", { separator: "." }) // { hours: 12, minutes: 34, seconds: 56 }
 */
export const convertTimeStringToTimeObject = (
  timeStr: string,
  options?: { separator?: string },
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

/**
 * Преобразует объект времени TimeObject в строку времени
 * @example
 * convertTimeObjectToTimeString({ hours: 12, minutes: 34, seconds: 56 }) // "12:34:56"
 * convertTimeObjectToTimeString({ hours: 12, minutes: 34, seconds: 56 }, { separator: "." }) // "12.34.56"
 */
export const convertTimeObjectToTimeString = (
  timeObj: TimeObject,
  options?: { separator?: string },
): string => {
  const { separator = ":" } = options || {};

  const { hours, minutes, seconds } = timeObj;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(separator);
};

/**
 * Преобразует объект даты Dayjs в объект времени TimeObject
 * @example
 * convertDayjsDateToTimeObject(dayjs("2021-01-01T12:34:56")) // { hours: 12, minutes: 34, seconds: 56 }
 */
export const convertDayjsDateToTimeObject = (date: Dayjs): TimeObject => {
  return {
    hours: date.hour(),
    minutes: date.minute(),
    seconds: date.second(),
  };
};

/**
 * Проверяет, является ли объект даты Dayjs
 * @example
 * isDayjs(dayjs("2021-01-01T12:34:56")) // true
 * isDayjs(new Date("2021-01-01T12:34:56")) // false
 */
export const isDayjs = (date: unknown): date is Dayjs => {
  return dayjs.isDayjs(date);
};

/**
 * Применяет объект времени TimeObject к объекту даты Dayjs
 * @example
 * applyTimeObjectToDayjsDate({ hours: 12, minutes: 34, seconds: 56 }, dayjs("2021-01-01T00:00:00")) // dayjs("2021-01-01T12:34:56")
 */
export const applyTimeObjectToDayjsDate = (
  timeObj: TimeObject,
  date?: Dayjs | Date,
): Dayjs => {
  const { hours, minutes, seconds } = timeObj;

  const dateInstance = isDayjs(date) ? date : dayjs(date ?? null);

  return dateInstance
    .set("hour", hours)
    .set("minute", minutes)
    .set("second", seconds);
};

/**
 * Преобразует объект даты Dayjs в объект даты Date
 * @example
 * convertDayjsDateToDate(dayjs("2021-01-01T12:34:56")) // new Date("2021-01-01T12:34:56")
 */
export const convertDayjsDateToDate = (dayjsDate: Dayjs): Date => {
  return dayjsDate.toDate();
};

/**
 * Преобразует количество секунд в объект времени TimeObject
 * @example
 * convertSecondsToTimeObject(12542) // { hours: 3, minutes: 25, seconds: 42 }
 */
export const convertSecondsToTimeObject = (
  totalSeconds: number,
): TimeObject => {
  let current = totalSeconds;

  const hours = Math.floor(current / 3600);
  current -= hours * 3600;

  const minutes = Math.floor(current / 60);
  current -= minutes * 60;

  const seconds = current;

  return {
    hours,
    minutes,
    seconds,
  };
};

type DurationLocale = "en" | "ru" | (string & {});

const DURATION_UNITS: Record<
  string,
  { d: string; h: string; m: string; s: string }
> = {
  en: { d: "d", h: "h", m: "m", s: "s" },
  ru: { d: "д", h: "ч", m: "м", s: "с" },
  zh: { d: "天", h: "时", m: "分", s: "秒" },
};

const getFallbackUnits = () => DURATION_UNITS["en"];

/**
 * Форматирует секунды в удобочитаемую строку длительности.
 * Ведущие нули единиц не показываются: если дней нет — они опускаются и т. д.
 * @example
 * formatDuration(86400 + 3600 * 6 + 60 * 23 + 10)        // "2d 6h 23m 10s"
 * formatDuration(86400 + 3600 * 6 + 60 * 23 + 10, "ru")   // "2д 6ч 23м 10с"
 * formatDuration(75, "en")                                 // "1m 15s"
 * formatDuration(0)                                        // "0s"
 */
export const formatDuration = (
  totalSeconds: number,
  locale: DurationLocale = "en",
): string => {
  const units = DURATION_UNITS[locale] ?? getFallbackUnits();

  const total = Math.max(0, Math.floor(totalSeconds));

  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}${units.d}`);
  if (days > 0 || hours > 0) parts.push(`${hours}${units.h}`);
  if (days > 0 || hours > 0 || minutes > 0) parts.push(`${minutes}${units.m}`);
  parts.push(`${seconds}${units.s}`);

  return parts.join(" ");
};

/**
 * Преобразует объект даты Date в количество секунд
 * @example
 * getTotalSecondsFromDay("2021-01-01T12:34:56") // 45296
 */
export const getTotalSecondsFromDay = (date?: string | Date | null): number => {
  const d = typeof date === "string" ? new Date(date) : (date ?? new Date());

  if (Number.isNaN(d?.getTime())) return 0;

  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
};

/**
 * Преобразует объект времени TimeObject в количество секунд
 * @example
 * convertTimeObjectToSeconds({ hours: 0, minutes: 1, seconds: 45 }) // 105
 */
export const convertTimeObjectToSeconds = (time: {
  hours: number;
  minutes: number;
  seconds: number;
}): number => time.hours * 3600 + time.minutes * 60 + time.seconds;