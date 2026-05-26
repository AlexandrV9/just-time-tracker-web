import dayjs from "dayjs";

export type Locale = string;

export function formatDate(
  date: Date,
  format: string,
  locale: Locale = "en",
): string {
  return dayjs(date).locale(locale).format(format);
}
