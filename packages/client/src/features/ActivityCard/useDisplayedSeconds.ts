import { useMemo, useRef } from "react";
import { useLiveTimestamp } from "./useLiveTimestamp";

type UseDisplayedSecondsProps = {
  currentActiveMs: number;
  analyticsFetchedAtMs: number;
  hasActiveSession: boolean;
};

export function useDisplayedSeconds({
  currentActiveMs,
  analyticsFetchedAtMs,
  hasActiveSession,
}: UseDisplayedSecondsProps) {
  const nowMs = useLiveTimestamp(hasActiveSession);

  /**
   * Последнее отображённое значение во время активной фазы.
   * Используется как нижняя граница при паузе, пока analytics не рефетчнулись,
   * и как fallback в первый тик после старта (nowMs ещё null).
   */
  const lastActiveSecondsRef = useRef(0);

  return useMemo(() => {
    if (!hasActiveSession) {
      const serverSeconds = Math.floor(currentActiveMs / 1000);
      return Math.max(serverSeconds, lastActiveSecondsRef.current);
    }

    if (nowMs === null) {
      return lastActiveSecondsRef.current;
    }

    const driftMs =
      analyticsFetchedAtMs > 0 ? Math.max(0, nowMs - analyticsFetchedAtMs) : 0;

    const seconds = Math.max(0, Math.floor((currentActiveMs + driftMs) / 1000));

    lastActiveSecondsRef.current = seconds;

    return seconds;
  }, [currentActiveMs, analyticsFetchedAtMs, hasActiveSession, nowMs]);
}
