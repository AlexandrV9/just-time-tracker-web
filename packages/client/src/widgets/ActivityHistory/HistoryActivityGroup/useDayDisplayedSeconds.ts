import { convertMillisecondsToSeconds } from "~/shared/ui";
import { useEffect, useMemo, useRef } from "react";
import { useNowMs } from "./useNowMs";

type UseDayDisplayedSecondsProps = {
  activeDurationMs: number;
  hasActiveSession: boolean;
  startedAt?: string;
  activityId?: string | null;
  /**
   * When set with an active session, live elapsed uses
   * `max(segmentStartedAt, this instant)` instead of `segmentStartedAt` alone
   * (clip open segment to the start of the list's calendar day).
   */
  liveElapsedClipFromIso?: string | null;
};

/**
 * Interval-scoped active time (e.g. for a calendar day in history) plus open active segment elapsed.
 */
export function useDayDisplayedSeconds({
  activeDurationMs,
  hasActiveSession,
  startedAt,
  activityId,
  liveElapsedClipFromIso,
}: UseDayDisplayedSecondsProps) {
  const nowMs = useNowMs(hasActiveSession);

  const lastSecondsRef = useRef(
    convertMillisecondsToSeconds(activeDurationMs),
  );

  useEffect(() => {
    lastSecondsRef.current = convertMillisecondsToSeconds(activeDurationMs);
  }, [activityId, activeDurationMs, startedAt, liveElapsedClipFromIso]);

  const seconds = useMemo(() => {
    if (!hasActiveSession || nowMs === null || !startedAt) {
      return convertMillisecondsToSeconds(activeDurationMs);
    }

    const startedAtMs = Date.parse(startedAt);
    if (!Number.isFinite(startedAtMs)) {
      return convertMillisecondsToSeconds(activeDurationMs);
    }

    let effectiveStartMs = startedAtMs;
    if (liveElapsedClipFromIso) {
      const clipMs = Date.parse(liveElapsedClipFromIso);
      if (Number.isFinite(clipMs)) {
        effectiveStartMs = Math.max(startedAtMs, clipMs);
      }
    }

    const elapsedMs = Math.max(0, nowMs - effectiveStartMs);
    return convertMillisecondsToSeconds(activeDurationMs + elapsedMs);
  }, [
    activeDurationMs,
    hasActiveSession,
    nowMs,
    startedAt,
    liveElapsedClipFromIso,
  ]);

  const stableSeconds = hasActiveSession
    ? Math.max(seconds, lastSecondsRef.current)
    : seconds;

  useEffect(() => {
    lastSecondsRef.current = stableSeconds;
  }, [stableSeconds]);

  return stableSeconds;
}
