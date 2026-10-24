import dayjs, { type Dayjs } from "dayjs";
import { DATE_KEY_FORMAT, DAYS_IN_WEEK } from "./constants";

/** Приводит дату к строковому ключу вида "2026-08-03". */
export const toDateKey = (date: Dayjs) => date.format(DATE_KEY_FORMAT);

/**
 * Возращает понедельник той недели, к которой относится переданная дата.
 */
export const getMonday = (date: Dayjs) => {
  const dayOfWeek = date.day();

  // В dayjs 0 — воскресенье, 6 — суббота
  const daysFromMonday = dayOfWeek === 0 ? DAYS_IN_WEEK - 1 : dayOfWeek - 1;

  return date.subtract(daysFromMonday, "day").startOf("day");
};

/** Семь дней недели, начиная с её понедельника. */
export const getWeekDays = (monday: Dayjs) =>
  Array.from({ length: DAYS_IN_WEEK }, (_, i) => monday.add(i, "day"));

/**
 * Ключи недель, симметрично расположенных вокруг опорной даты.
 *
 * @param center - опорная дата (ожидается понедельник)
 * @param side - количество недель в каждую сторону от центра
 *
 * @example
 * // side = 1 → 3 недели: прошлая, центральная, следующая
 * generateWeekKeysAround(dayjs("2026-08-03"), 1)
 * // → ["2026-07-27", "2026-08-03", "2026-08-10"]
 */
export const generateWeekKeysAround = (center: Dayjs, side: number): string[] =>
  Array.from({ length: side * 2 + 1 }, (_, i) =>
    toDateKey(center.add((i - side) * DAYS_IN_WEEK, "day")),
  );

/** `count` ключей недель перед `firstKey`, в хронологическом порядке. */
export const getWeekKeysBefore = (
  firstKey: string,
  count: number,
): string[] => {
  const first = dayjs(firstKey);

  return Array.from({ length: count }, (_, i) =>
    toDateKey(first.subtract((count - i) * DAYS_IN_WEEK, "day")),
  );
};

/** `count` ключей недель после `lastKey`, в хронологическом порядке. */
export const getWeekKeysAfter = (lastKey: string, count: number): string[] => {
  const last = dayjs(lastKey);

  return Array.from({ length: count }, (_, i) =>
    toDateKey(last.add((i + 1) * DAYS_IN_WEEK, "day")),
  );
};

/** Ключи всех дат в диапазоне [fromKey, toKey] включительно. */
export const getDateKeysInRange = (
  fromKey: string,
  toKey: string,
): string[] => {
  const end = dayjs(toKey);
  const keys: string[] = [];

  let cursor = dayjs(fromKey);

  while (!cursor.isAfter(end, "day")) {
    keys.push(toDateKey(cursor));
    cursor = cursor.add(1, "day");
  }

  return keys;
};

/**
 * Дата, по которой строится подпись «месяц год» над лентой.
 *
 * Если выбранный день попадает в видимую неделю — берём именно его. Иначе
 * переход на «1 августа» из выбора месяца встал бы на неделю с 27 июля,
 * и середина недели показала бы «июль». Во время свайпа выбранного дня
 * в неделе нет, и мы берём её середину — подпись меняется вместе с пальцем.
 */
export const resolveLabelDate = (weekStart: Dayjs, selected: Dayjs | null) => {
  const weekEnd = weekStart.add(DAYS_IN_WEEK - 1, "day");

  const isSelectedInWeek =
    selected !== null &&
    !selected.isBefore(weekStart, "day") &&
    !selected.isAfter(weekEnd, "day");

  return isSelectedInWeek ? selected : weekStart.add(3, "day");
};

export const getWeekdayLabel = (date: Dayjs, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date.toDate());

/**
 * Подпись «месяц год» без локальных суффиксов.
 *
 * Месяц и год форматируются раздельно: сплошной формат в ru-локали
 * добавил бы «г.» («август 2026 г.»).
 */
export const getMonthYearLabel = (date: Dayjs, locale: string) => {
  const nativeDate = date.toDate();

  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    nativeDate,
  );

  const year = new Intl.DateTimeFormat(locale, { year: "numeric" })
    .formatToParts(nativeDate)
    .find((part) => part.type === "year")?.value;

  return `${month} ${year}`;
};
