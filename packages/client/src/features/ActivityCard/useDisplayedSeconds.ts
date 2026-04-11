import { useMemo, useRef } from "react";
import { calculateDisplayedSeconds } from "./utils";

type UseDisplayedSecondsProps = {
  currentActiveMs: number;
  analyticsFetchedAtMs: number;
  hasActiveSession: boolean;
  nowMs: number;
};

export function useDisplayedSeconds({
  currentActiveMs,
  analyticsFetchedAtMs,
  hasActiveSession,
  nowMs,
}: UseDisplayedSecondsProps) {
  /**
   * Последнее "зафиксированное" значение таймера.
   *
   * Когда активность НЕ активна:
   * - мы сохраняем сюда серверное значение
   *
   * Когда пользователь снова нажимает Start:
   * - мы продолжаем считать время ОТ ЭТОГО значения
   *
   * Это защищает от скачков:
   * paused → start → refetch → значение не откатывается назад
   */
  const lastStableSecondsRef = useRef<number | null>(null);

  /**
   * Момент (в миллисекундах), когда мы локально зафиксировали
   * переход в активное состояние.
   *
   * Используется как точка отсчёта для "живого" таймера:
   * nowMs - resumedAtWallClockMs = сколько прошло после resume
   */
  const resumedAtWallClockMsRef = useRef<number | null>(null);

  return useMemo(() => {
    /**
     * Вычисляем новое значение таймера + новые значения для refs
     * (они возвращаются как nextLastStableSeconds и nextResumedAtWallClockMs)
     */
    const result = calculateDisplayedSeconds({
      currentActiveMs,
      analyticsFetchedAtMs,
      hasActiveSession,
      nowMs,
      lastStableSeconds: lastStableSecondsRef.current,
      resumedAtWallClockMs: resumedAtWallClockMsRef.current,
    });

    /**
     * Сохраняем новое "состояние" между рендерами.
     * Это позволяет нам помнить:
     * - от какого значения продолжать таймер
     * - когда начался текущий активный интервал
     */
    lastStableSecondsRef.current = result.nextLastStableSeconds;
    resumedAtWallClockMsRef.current = result.nextResumedAtWallClockMs;

    return result.displayedSeconds;
  }, [currentActiveMs, analyticsFetchedAtMs, hasActiveSession, nowMs]);
}
