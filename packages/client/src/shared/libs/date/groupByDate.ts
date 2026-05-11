import {
  format,
  getISOWeek,
  getISOWeekYear,
  isValid,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { CalendarDay, GroupByDate } from "./types";

type WithCreatedAt = {
  createdAt: string;
};

/**
 * Группирует элементы по дате
 * @example
 * groupByDate([{ createdAt: "2021-01-01T12:34:56" }], "day") // { "2021-01-01": [{ createdAt: "2021-01-01T12:34:56" }] }
 */
export function groupByDate<T extends WithCreatedAt>(
  items: T[],
  groupBy: GroupByDate,
  dateExtractor?: (item: T) => string,
): Record<CalendarDay, T[]> {
  const map = new Map<string, { date: Date; items: T[] }>();

  for (const item of items) {
    const raw = dateExtractor ? dateExtractor(item) : item.createdAt;
    const date = dateFromCreatedAt(raw);
    if (!date) {
      continue;
    }

    let key: string;
    let sortDate: Date;

    switch (groupBy) {
      case "day":
        key = format(date, "yyyy-MM-dd");
        sortDate = startOfDay(date);
        break;

      case "month":
        key = format(date, "yyyy-MM");
        sortDate = new Date(date.getFullYear(), date.getMonth(), 1);
        break;

      case "year":
        key = format(date, "yyyy");
        sortDate = new Date(date.getFullYear(), 0, 1);
        break;

      case "week": {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const week = getISOWeek(date);
        const year = getISOWeekYear(date);

        key = `${year}-W${String(week).padStart(2, "0")}`;
        sortDate = weekStart;
        break;
      }
    }

    if (!map.has(key)) {
      map.set(key, { date: sortDate, items: [] });
    }

    map.get(key)!.items.push(item);
  }

  const sortedEntries = Array.from(map.entries()).sort(
    (a, b) => b[1].date.getTime() - a[1].date.getTime(),
  );

  const result: Record<string, T[]> = {};

  for (const [key, value] of sortedEntries) {
    result[key] = value.items;
  }

  return result;
}

function dateFromCreatedAt(createdAt: string): Date | null {
  const d = new Date(createdAt);

  if (!isValid(d)) {
    console.error("Invalid date from createdAt", createdAt);
  }

  return isValid(d) ? d : null;
}
