import type { ActivityDTO } from "@to-do-list/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";

import {
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { getLocalCalendarDayKey } from "~/shared/libs";

import {
  formatDurationLabel,
  getLocalDayBoundsIso,
  resolveDisplayedSeconds,
} from "./utils";
import { useTickingNow } from "./useTickingNow";

type UseActivityCardDataArgs = {
  activityId?: ActivityDTO["id"];
  currentSessionId?: ActivityDTO["currentSessionId"];
  /** Calendar key of the list group (from activity `createdAt`). */
  dayKey: string;
  /** Row status from the activities list; used until the session request resolves. */
  activityStatus: ActivityDTO["status"];
};

export function useActivityCardData({
  activityId,
  currentSessionId,
  dayKey,
  activityStatus,
}: UseActivityCardDataArgs) {
  /**
   * Open active segments end at "now" on the server. If the card sits under an older
   * `dayKey` (grouped by createdAt), that day's window excludes today's segment → 0 ms
   * and the UI only shows drift since page load. While running, ask analytics for today.
   */
  const analyticsDayKey =
    activityStatus === "active"
      ? getLocalCalendarDayKey(new Date())
      : dayKey;

  const { fromDate, toDate } = useMemo(
    () => getLocalDayBoundsIso(analyticsDayKey),
    [analyticsDayKey],
  );

  const { data: currentSession, isLoading: isLoadingCurrentSession } = useQuery(
    {
      queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, currentSessionId],
      enabled: Boolean(currentSessionId),
      queryFn: async () => {
        if (!currentSessionId) return undefined;

        const response = await activityApiService.getActivitySession({
          id: currentSessionId,
        });

        return response.success ? response.data : undefined;
      },
    },
  );
  const hasActiveSession =
    currentSession !== undefined
      ? currentSession.status === "active"
      : activityStatus === "active" && Boolean(currentSessionId);

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    dataUpdatedAt,
  } = useQuery({
    queryKey: [ACTIVITY_ANALYTICS_QUERY_KEY, activityId, fromDate, toDate],
    queryFn: async () => {
      if (!activityId) return undefined;

      const response = await activityApiService.getActivityAnalytics({
        activityId: activityId!,
        fromDate,
        toDate,
      });

      return response.success ? response.data : undefined;
    },
    enabled: !!activityId,
    placeholderData: keepPreviousData,
  });

  const currentActiveMs = analytics?.totals?.activeDurationMs ?? 0;

  const nowMs = useTickingNow(hasActiveSession);

  /** Last stable total (seconds) while not running — used so Play resumes from that value, not from 0 after refetch races. */
  const pausedDisplaySecondsRef = useRef<number | null>(null);
  /** Wall-clock start of the current active spell (after pause / idle). */
  const resumeWallMsRef = useRef<number | null>(null);

  const displayedSeconds = useMemo(() => {
    const raw = resolveDisplayedSeconds({
      currentActiveMs,
      analyticsFetchedAtMs: dataUpdatedAt,
      hasActiveSession,
      nowMs,
    });

    if (!hasActiveSession) {
      resumeWallMsRef.current = null;
      pausedDisplaySecondsRef.current = raw;
      return raw;
    }

    // Active: if we ever saw a non-active state this mount, continue from that snapshot + live delta.
    if (pausedDisplaySecondsRef.current === null) {
      return raw;
    }

    if (resumeWallMsRef.current === null) {
      resumeWallMsRef.current = Date.now();
    }

    return (
      pausedDisplaySecondsRef.current +
      Math.floor((nowMs - resumeWallMsRef.current) / 1000)
    );
  }, [currentActiveMs, dataUpdatedAt, hasActiveSession, nowMs]);

  const displayedTime = useMemo(
    () => formatDurationLabel(displayedSeconds),
    [displayedSeconds],
  );

  const sessionStatusForControls =
    currentSession !== undefined
      ? currentSession.status
      : activityStatus === "active" || activityStatus === "paused"
        ? activityStatus
        : undefined;

  return {
    displayedTime,
    sessionStatus: sessionStatusForControls,
    hasActiveSession,
    isLoading: isLoadingAnalytics || isLoadingCurrentSession,
  };
}
