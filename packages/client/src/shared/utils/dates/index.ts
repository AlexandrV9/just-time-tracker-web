import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

export type DayInterval = {
  fromDate: string;
  toDate: string;
};

/**
 * Returns an ISO time interval for the given day.
 *
 * The interval covers the full day:
 * - fromDate — start of the day (00:00:00.000)
 * - toDate   — end of the day (23:59:59.999)
 *
 * @param date - Date, ISO string or Dayjs instance
 * @returns DayInterval object with `fromDate` and `toDate` in ISO format
 *
 * @example
 * getDayInterval(new Date("2025-12-31"));
 * // {
 * //   fromDate: "2025-12-31T00:00:00.000Z",
 * //   toDate: "2025-12-31T23:59:59.999Z"
 * // }
 */
export const getDayInterval = (
  date?: Date | string | Dayjs | null
): DayInterval => {
  const d = date ? dayjs(date) : dayjs();

  return {
    fromDate: d.startOf("day").toISOString(),
    toDate: d.endOf("day").toISOString(),
  };
};

/**
 * Formats a date as "day + localized month name" according to the given locale.
 *
 * The function:
 * - Uses `Intl.DateTimeFormat` to ensure correct month declension
 *   (e.g. "4 января" for `ru`, "January 4" for `en`).
 * - Automatically respects the provided locale.
 * - Capitalizes the first letter of the month name for consistent UI style.
 *
 * @param date - JavaScript Date object to format.
 * @param locale - BCP 47 locale string (e.g. "ru", "en", "fr").
 *
 * @returns Formatted date string with capitalized month name
 * (e.g. "4 Января", "January 4").
 */
export const formatDateWithMonth = (date: Date, locale: string): string => {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  });

  const formatted = formatter.format(date);

  return formatted.replace(
    /\p{L}+/u,
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
};
