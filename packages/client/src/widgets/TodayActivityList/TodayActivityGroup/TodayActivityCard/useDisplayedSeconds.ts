import type {
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { convertMillisecondsToSeconds } from "~/shared/ui";
import { useEffect, useMemo, useRef } from "react";
import { useNowMs } from "./useNowMs";

type UseSessionActiveDisplayedSecondsProps = {
  session: ActivitySessionDTO | null;
  segment: ActivitySessionSegmentDTO | null;
  activityId?: string | null;
};

/**
 * Active time for the **current open session** only (not day-scoped).
 * Open active segment is added live; closed portions live in `session.activeDurationMs`.
 */
export function useDisplayedSeconds({
  session,
  segment,
  activityId,
}: UseSessionActiveDisplayedSecondsProps) {
  const hasRunningSession =
    session?.status === "active" || session?.status === "paused";

  const isActiveSegement = segment?.type === "active";

  const nowMs = useNowMs(isActiveSegement);

  const baseMs = session?.activeDurationMs ?? 0;

  const lastSecondsRef = useRef(convertMillisecondsToSeconds(baseMs));

  useEffect(() => {
    lastSecondsRef.current = convertMillisecondsToSeconds(baseMs);
  }, [activityId, baseMs, session?.id]);

  const seconds = useMemo(() => {
    if (!session || !hasRunningSession) {
      return 0;
    }

    let totalMs = baseMs;

    if (isActiveSegement && nowMs != null && segment?.startedAt) {
      const segmentStartedMs = Date.parse(segment.startedAt);
      if (Number.isFinite(segmentStartedMs)) {
        totalMs += Math.max(0, nowMs - segmentStartedMs);
      }
    }

    return convertMillisecondsToSeconds(totalMs);
  }, [
    session,
    hasRunningSession,
    baseMs,
    isActiveSegement,
    nowMs,
    segment?.startedAt,
  ]);

  const stableSeconds =
    hasRunningSession && isActiveSegement
      ? Math.max(seconds, lastSecondsRef.current)
      : seconds;

  useEffect(() => {
    lastSecondsRef.current = stableSeconds;
  }, [stableSeconds]);

  return stableSeconds;
}
