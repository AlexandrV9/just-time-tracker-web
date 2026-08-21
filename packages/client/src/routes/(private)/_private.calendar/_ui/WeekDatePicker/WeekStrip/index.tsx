import dayjs, { type Dayjs } from "dayjs";
import { memo, useMemo } from "react";
import { Flex } from "~/shared/ui";
import { getWeekDays, getWeekdayLabel, toDateKey } from "../utils";
import { DayCell } from "./DayCell";

type WeekStripProps = {
  /** Ключ понедельника недели, например "2026-08-03". */
  weekStartKey: string;
  /** Ключ выбранной даты или null. */
  selectedDateKey: string | null;
  locale: string;
  /** Ключ даты → количество активностей; нет ключа — день ещё не загружен. */
  activityCountByDate: ReadonlyMap<string, number>;
  onSelectDate: (day: Dayjs) => void;
};

/**
 * Один слайд ленты — семь дней недели.
 *
 * Все пропсы либо примитивы, либо стабильные ссылки, поэтому хватает
 * поверхностного сравнения в `memo`: соседние слайды не перерисовываются
 * на каждый кадр свайпа.
 */
export const WeekStrip = memo(function WeekStrip({
  weekStartKey,
  selectedDateKey,
  locale,
  activityCountByDate,
  onSelectDate,
}: WeekStripProps) {
  const weekDays = useMemo(
    () => getWeekDays(dayjs(weekStartKey)),
    [weekStartKey],
  );

  const todayKey = toDateKey(dayjs());

  return (
    <Flex gap="6px" w="full" justifyContent="space-between">
      {weekDays.map((day) => {
        const dateKey = toDateKey(day);

        return (
          <DayCell
            key={dateKey}
            day={day}
            weekdayLabel={getWeekdayLabel(day, locale)}
            isSelected={dateKey === selectedDateKey}
            isToday={dateKey === todayKey}
            activityCount={activityCountByDate.get(dateKey)}
            onSelect={onSelectDate}
          />
        );
      })}
    </Flex>
  );
});
