import { useMemo, useRef } from "react";
import { useLiveTimestamp } from "./useLiveTimestamp";

type UseDisplayedSecondsProps = {
  activeDurationMs: number;
  hasActiveSession: boolean;
};

export function useDisplayedSeconds({
  activeDurationMs,
  hasActiveSession,
}: UseDisplayedSecondsProps) {
  const nowMs = useLiveTimestamp(hasActiveSession);

  const fetchedAtRef = useRef(Date.now());

  const prevMsRef = useRef(activeDurationMs);

  if (prevMsRef.current !== activeDurationMs) {
    prevMsRef.current = activeDurationMs;
    fetchedAtRef.current = Date.now();
  }

  /**
   * Последнее отображённое значение во время активной фазы.
   * Используется как нижняя граница при паузе, пока данные не обновились,
   * и как fallback в первый тик после старта (nowMs ещё null).
   */
  const lastActiveSecondsRef = useRef(0);

  return useMemo(() => {
    if (!hasActiveSession) {
      const serverSeconds = Math.floor(activeDurationMs / 1000);
      return Math.max(serverSeconds, lastActiveSecondsRef.current);
    }

    if (nowMs === null) {
      return lastActiveSecondsRef.current;
    }

    const driftMs = Math.max(0, nowMs - fetchedAtRef.current);
    const seconds = Math.max(
      0,
      Math.floor((activeDurationMs + driftMs) / 1000),
    );

    lastActiveSecondsRef.current = seconds;

    return seconds;
  }, [activeDurationMs, hasActiveSession, nowMs]);
}
