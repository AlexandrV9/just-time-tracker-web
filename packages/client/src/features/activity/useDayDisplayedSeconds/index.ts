import { convertMillisecondsToSeconds } from "~/shared/ui";
import { useEffect, useMemo, useRef } from "react";
import { useNowMs } from "~/shared/hooks";

type UseDayDisplayedSecondsProps = {
  activeDurationMs: number;
  hasActiveSession: boolean;
  startedAt?: string | null;
  activityId?: string | null;
  /**
   * When set with an active session, live elapsed uses
   * `max(segmentStartedAt, this instant)` instead of `segmentStartedAt` alone
   * (clip open segment to the start of the list's calendar day).
   */
  liveElapsedClipFromIso?: string | null;
};

/**
 * Interval-scoped active time for a window (e.g. calendar day) plus open **active** segment elapsed.
 * Ticks only when both `hasActiveSession` and `startedAt` are set (live active segment).
 */
export function useDayDisplayedSeconds({
  activeDurationMs,
  hasActiveSession,
  startedAt,
  activityId,
  liveElapsedClipFromIso,
}: UseDayDisplayedSecondsProps) {
  const shouldTick = Boolean(startedAt && hasActiveSession);
  const nowMs = useNowMs(shouldTick);

  const lastSecondsRef = useRef(convertMillisecondsToSeconds(activeDurationMs));

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

  const stableSeconds = shouldTick
    ? Math.max(seconds, lastSecondsRef.current)
    : seconds;

  useEffect(() => {
    lastSecondsRef.current = stableSeconds;
  }, [stableSeconds]);

  return stableSeconds;
}
