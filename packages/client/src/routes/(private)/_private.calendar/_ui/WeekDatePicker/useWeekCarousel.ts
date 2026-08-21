import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useMemo, useState } from "react";
import {
  EDGE_THRESHOLD_WEEKS,
  GROW_BY_WEEKS,
  INITIAL_SIDE_WEEKS,
} from "./constants";
import { useHorizontalCarousel } from "./useHorizontalCarousel";
import {
  generateWeekKeysAround,
  getMonday,
  getWeekKeysAfter,
  getWeekKeysBefore,
} from "./utils";

/**
 * Лента недель поверх обобщённой карусели.
 *
 * Отвечает только за «недельную» специфику: раздаёт ключи понедельников
 * и умеет перестроить ленту вокруг произвольной даты.
 */
export function useWeekCarousel(initialDate?: Date | null) {
  const [initialKeys] = useState(() =>
    generateWeekKeysAround(
      getMonday(initialDate ? dayjs(initialDate) : dayjs()),
      INITIAL_SIDE_WEEKS,
    ),
  );

  const {
    viewportRef,
    keys: weekKeys,
    activeIndex,
    settledIndex,
    scrollPrev,
    scrollNext,
    rebuild,
  } = useHorizontalCarousel({
    initialKeys,
    startIndex: INITIAL_SIDE_WEEKS,
    growBy: GROW_BY_WEEKS,
    edge: EDGE_THRESHOLD_WEEKS,
    getKeysBefore: getWeekKeysBefore,
    getKeysAfter: getWeekKeysAfter,
  });

  /** Неделя под пальцем — для подписи «месяц год». */
  const activeWeekStart = useWeekStartAt(weekKeys, activeIndex);
  /** Неделя после остановки прокрутки — для загрузки данных. */
  const settledWeekStart = useWeekStartAt(weekKeys, settledIndex);

  const jumpToWeekOf = useCallback(
    (date: Dayjs) => {
      rebuild(
        generateWeekKeysAround(getMonday(date), INITIAL_SIDE_WEEKS),
        INITIAL_SIDE_WEEKS,
      );
    },
    [rebuild],
  );

  return {
    viewportRef,
    weekKeys,
    activeWeekStart,
    settledWeekStart,
    scrollPrev,
    scrollNext,
    jumpToWeekOf,
  };
}

function useWeekStartAt(weekKeys: string[], index: number) {
  return useMemo(
    () => dayjs(weekKeys[index] ?? weekKeys[0]),
    [weekKeys, index],
  );
}
