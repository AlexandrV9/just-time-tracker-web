import { convertMillisecondsToSeconds } from "~/shared/ui";
import { useEffect, useMemo, useRef } from "react";
import { useNowMs } from "./useNowMs";

type UseDisplayedSecondsProps = {
  activeDurationMs: number;
  hasActiveSession: boolean;
  startedAt?: string;
  activityId?: string | null;
};

export function useDisplayedSeconds({
  activeDurationMs,
  hasActiveSession,
  startedAt,
  activityId,
}: UseDisplayedSecondsProps) {
  const nowMs = useNowMs(hasActiveSession);

  const lastSecondsRef = useRef(convertMillisecondsToSeconds(activeDurationMs));

  // Reset the lower-bound guard whenever the activity or its base duration changes.
  useEffect(() => {
    lastSecondsRef.current = convertMillisecondsToSeconds(activeDurationMs);
  }, [activityId, activeDurationMs, startedAt]);

  const seconds = useMemo(() => {
    if (!hasActiveSession || nowMs === null || !startedAt) {
      return convertMillisecondsToSeconds(activeDurationMs);
    }

    const startedAtMs = Date.parse(startedAt);
    if (!Number.isFinite(startedAtMs)) {
      return convertMillisecondsToSeconds(activeDurationMs);
    }

    // activeDurationMs = historical completed segments only (server no longer
    // includes the open segment). Add elapsed time of the current segment.
    const elapsedMs = Math.max(0, nowMs - startedAtMs);
    return convertMillisecondsToSeconds(activeDurationMs + elapsedMs);
  }, [activeDurationMs, hasActiveSession, nowMs, startedAt]);

  // Prevent backward jumps that can occur when data refetches return slightly
  // stale values (e.g. analytics settling after a mutation).
  const stableSeconds = hasActiveSession
    ? Math.max(seconds, lastSecondsRef.current)
    : seconds;

  useEffect(() => {
    lastSecondsRef.current = stableSeconds;
  }, [stableSeconds]);

  return stableSeconds;
}
