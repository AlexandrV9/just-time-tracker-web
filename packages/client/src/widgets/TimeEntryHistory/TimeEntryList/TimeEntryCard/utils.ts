type FormattedActivityDates =
  | {
      kind: "single";
      value: string; // например: "Yesterday · 10:00–11:20"
    }
  | {
      kind: "range";
      start: string; // например: "Mar 12 23:00"
      end: string;   // например: "Mar 13 01:00"
    };

type FormatActivityDatesOptions = {
  locale?: string;      // "ru-RU", "en-US"
  now?: Date;           // для тестов
  use24h?: boolean;     // по умолчанию true
};

export function formatActivityDates(
  startIso: string,
  endIso: string,
  options: FormatActivityDatesOptions = {}
): FormattedActivityDates {
  const { locale = "ru-RU", now = new Date(), use24h = true } = options;

  const start = parseLocalIso(startIso);
  const end = parseLocalIso(endIso);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid ISO datetime. Expected format: YYYY-MM-DDThh:mm:ss");
  }

  if (end.getTime() < start.getTime()) {
    throw new Error("endIso must be greater than or equal to startIso");
  }

  if (isSameDay(start, end)) {
    const dayLabel = formatRelativeDayLabel(start, now, locale);
    const timeRange = `${formatTime(start, locale, use24h)}–${formatTime(end, locale, use24h)}`;

    return {
      kind: "single",
      value: dayLabel ? `${dayLabel} · ${timeRange}` : timeRange,
    };
  }

  return {
    kind: "range",
    start: formatFullCompact(start, now, locale, use24h),
    end: formatFullCompact(end, now, locale, use24h),
  };
}

/**
 * Парсит YYYY-MM-DDThh:mm:ss как локальное время.
 * Не используем new Date(iso) напрямую, чтобы избежать двусмысленности.
 */
function parseLocalIso(iso: string): Date {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(iso);

  if (!match) {
    return new Date(NaN);
  }

  const [, y, m, d, hh, mm, ss = "00"] = match;

  return new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss)
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDays(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / msPerDay);
}

function formatRelativeDayLabel(date: Date, now: Date, locale: string): string | null {
  const diff = diffInDays(date, now);

  if (diff === 0) return null;

  if (diff === -1) {
    return locale.startsWith("ru") ? "Вчера" : "Yesterday";
  }

  if (diff > -7 && diff < 0) {
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  }

  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date, locale: string, use24h: boolean): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !use24h ? true : false,
  }).format(date);
}

function formatFullCompact(
  date: Date,
  now: Date,
  locale: string,
  use24h: boolean
): string {
  const sameYear = date.getFullYear() === now.getFullYear();

  const datePart = new Intl.DateTimeFormat(locale, sameYear
    ? { month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" }
  ).format(date);

  return `${datePart} ${formatTime(date, locale, use24h)}`;
}


// formatActivityDates("2026-03-29T10:00:00", "2026-03-29T11:20:00")
// { kind: "single", value: "10:00–11:20" }   // если сегодня

// formatActivityDates("2026-03-28T10:00:00", "2026-03-28T11:20:00")
// { kind: "single", value: "Вчера · 10:00–11:20" }

// formatActivityDates("2026-03-12T23:00:00", "2026-03-13T01:00:00")
// { kind: "range", start: "12 мар. 23:00", end: "13 мар. 01:00" }

// formatActivityDates("2025-12-31T23:00:00", "2026-01-01T01:00:00")
// { kind: "range", start: "31 дек. 2025 23:00", end: "1 янв. 2026 01:00" }