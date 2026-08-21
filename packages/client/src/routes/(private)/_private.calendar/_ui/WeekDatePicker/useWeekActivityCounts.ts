import type { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useDayPlansByRange } from "~/features/dayPlan";
import { DAYS_IN_WEEK } from "./constants";
import { getDateKeysInRange, toDateKey } from "./utils";

/** Сколько соседних недель грузим про запас, чтобы маркеры были готовы до конца свайпа. */
const PRELOAD_WEEKS = 1;

/**
 * Количество запланированных активностей по датам — для маркеров в ленте.
 *
 * Запрос идёт по окну «неделя ± соседние», а результат копится в одной Map:
 * уже загруженные недели не мигают пустыми маркерами, когда пользователь
 * пролистывает ленту туда-обратно.
 *
 * @param weekStart - понедельник недели, на которой остановилась прокрутка
 * @returns Map «ключ даты → количество активностей»; отсутствие ключа
 * означает, что день ещё не загружен
 */
export function useWeekActivityCounts(
  weekStart: Dayjs,
): ReadonlyMap<string, number> {
  const fromDate = toDateKey(
    weekStart.subtract(PRELOAD_WEEKS * DAYS_IN_WEEK, "day"),
  );
  const toDate = toDateKey(
    weekStart.add((PRELOAD_WEEKS + 1) * DAYS_IN_WEEK - 1, "day"),
  );

  const { activityCountByDate: loadedCounts, isFetching } = useDayPlansByRange({
    fromDate,
    toDate,
  });

  const [countByDate, setCountByDate] = useState(
    () => new Map<string, number>(),
  );

  useEffect(() => {
    // Пока запрос в полёте, в loadedCounts лежат данные предыдущего окна
    // (keepPreviousData) — записывать их в текущий диапазон нельзя.
    if (isFetching) return;

    setCountByDate((prev) => {
      const next = new Map(prev);
      let hasChanges = false;

      for (const dateKey of getDateKeysInRange(fromDate, toDate)) {
        const count = loadedCounts.get(dateKey) ?? 0;

        if (next.get(dateKey) !== count) {
          next.set(dateKey, count);
          hasChanges = true;
        }
      }

      // Ссылку меняем только при реальных изменениях: от неё зависит memo WeekStrip.
      return hasChanges ? next : prev;
    });
  }, [isFetching, fromDate, toDate, loadedCounts]);

  return countByDate;
}
