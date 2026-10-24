import dayjs from "dayjs";

export type Locale = string;

export function formatDate(
  date: Date,
  format = "YYYY-MM-DD",
  locale: Locale = "en",
): string {
  return dayjs(date).locale(locale).format(format);
}
