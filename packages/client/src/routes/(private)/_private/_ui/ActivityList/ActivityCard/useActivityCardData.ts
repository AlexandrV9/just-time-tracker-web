import type { ActivityDTO } from "@to-do-list/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";

import {
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";

import {
  formatDurationLabel,
  getLocalDayBoundsIso,
  resolveDisplayedSeconds,
} from "./utils";
import { useTickingNow } from "./useTickingNow";

type UseActivityCardDataArgs = {
  activityId?: ActivityDTO["id"];
  currentSessionId?: ActivityDTO["currentSessionId"];
  dayKey: string;
};

export function useActivityCardData({
  activityId,
  currentSessionId,
  dayKey,
}: UseActivityCardDataArgs) {
  const { fromDate, toDate } = useMemo(
    () => getLocalDayBoundsIso(dayKey),
    [dayKey],
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
  const currentSessionStatus = currentSession?.status;

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
  const hasActiveSession = currentSessionStatus === "active";

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

  return {
    displayedTime,
    sessionStatus: currentSessionStatus,
    hasActiveSession,
    isLoading: isLoadingAnalytics || isLoadingCurrentSession,
  };
}
