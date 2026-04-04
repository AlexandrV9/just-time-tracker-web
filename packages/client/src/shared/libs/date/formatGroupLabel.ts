import { endOfWeek, parseISO, startOfWeek } from "date-fns";
import type { GroupByDate } from "./types";

export type FormatGroupLabelProps = {
  key: string;
  groupBy: GroupByDate;
  locale?: string;
};

export const formatGroupLabel = ({
  key,
  groupBy,
  locale,
}: FormatGroupLabelProps): string => {
  const intlLocale = locale || "en-US";

  switch (groupBy) {
    case "day": {
      const date = parseISO(key);

      return new Intl.DateTimeFormat(intlLocale, {
        weekday: "short",
        month: "long",
        day: "numeric",
      }).format(date);
    }

    case "month": {
      const date = parseISO(`${key}-01`);

      return new Intl.DateTimeFormat(intlLocale, {
        month: "long",
        year: "numeric",
      }).format(date);
    }

    case "year": {
      return key;
    }

    case "week": {
      const [yearPart, weekPart] = key.split("-W");
      const year = Number(yearPart);
      const week = Number(weekPart);

      if (Number.isNaN(year) || Number.isNaN(week)) {
        return key;
      }

      const firstWeekReference = new Date(year, 0, 4);

      const weekStart = startOfWeek(firstWeekReference, { weekStartsOn: 1 });
      weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      const startLabel = new Intl.DateTimeFormat(intlLocale, {
        month: "short",
        day: "numeric",
      }).format(weekStart);

      const endLabel = new Intl.DateTimeFormat(intlLocale, {
        month: "short",
        day: "numeric",
      }).format(weekEnd);

      return `${startLabel} – ${endLabel}`;
    }
  }
};
