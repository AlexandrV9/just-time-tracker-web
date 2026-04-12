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
  const lastStableSecondsRef = useRef<number | null>(null);
  const resumedAtWallClockMsRef = useRef<number | null>(null);

  /**
   * Отслеживаем предыдущее значение hasActiveSession, чтобы определить
   * момент перехода из неактивного в активное состояние (isJustActivated).
   * В этот первый рендер nowMs ещё stale (useLiveTimestamp effect не успел
   * отработать), поэтому нельзя использовать nowMs как resumedAtWallClockMs.
   */
  const prevHasActiveSessionRef = useRef<boolean>(hasActiveSession);

  return useMemo(() => {
    const isJustActivated =
      hasActiveSession && !prevHasActiveSessionRef.current;
    prevHasActiveSessionRef.current = hasActiveSession;

    const result = calculateDisplayedSeconds({
      currentActiveMs,
      analyticsFetchedAtMs,
      hasActiveSession,
      nowMs,
      lastStableSeconds: lastStableSecondsRef.current,
      resumedAtWallClockMs: resumedAtWallClockMsRef.current,
      isJustActivated,
    });

    lastStableSecondsRef.current = result.nextLastStableSeconds;
    resumedAtWallClockMsRef.current = result.nextResumedAtWallClockMs;

    return result.displayedSeconds;
  }, [currentActiveMs, analyticsFetchedAtMs, hasActiveSession, nowMs]);
}
