import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivityStatusDTO,
} from "@to-do-list/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";

import { formatDurationLabel, resolveHasActiveSession } from "./utils";
import {
  getDateIntervalByCalendarDay,
  getLocalCalendarDay,
  type CalendarDay,
} from "~/shared/libs";
import { useDisplayedSeconds } from "./useDisplayedSeconds";
import type { PreloadedAnalytics } from "./index";

type UseActivityCardDataProps = {
  activityId: ActivityDTO["id"];
  currentSessionId?: ActivitySessionDTO["id"] | null;
  calendarDay?: CalendarDay;
  activityStatus: ActivityStatusDTO;
  preloadedAnalytics?: PreloadedAnalytics;
};

export function useActivityCardData({
  activityId,
  currentSessionId,
  calendarDay,
  activityStatus,
  preloadedAnalytics,
}: UseActivityCardDataProps) {
  const { data: currentSession, isLoading: isLoadingCurrentSession } = useQuery(
    {
      queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, currentSessionId],
      // Only fetch the session when the activity is currently active.
      // For paused/finished activities, activityStatus is a reliable fallback.
      enabled: Boolean(currentSessionId) && activityStatus === "active",
      queryFn: async () => {
        if (!currentSessionId) return undefined;

        const response = await activityApiService.getActivitySession({
          id: currentSessionId,
        });

        return response.success ? response.data : undefined;
      },
    },
  );

  // When the session query is disabled, `currentSession` holds stale cache data.
  // Derive the authoritative session status from `activityStatus` instead.
  const sessionQueryEnabled = Boolean(currentSessionId) && activityStatus === "active";
  const effectiveSessionStatus = sessionQueryEnabled
    ? currentSession?.status
    : activityStatus === "paused"
      ? "paused"
      : undefined;

  const hasActiveSession = resolveHasActiveSession({
    activityStatus,
    currentSessionStatus: currentSession?.status,
  });

  const { fromDate, toDate } = useMemo(
    () => getDateIntervalByCalendarDay(calendarDay ?? getLocalCalendarDay()),
    [calendarDay],
  );

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    dataUpdatedAt: analyticsDataUpdatedAt,
  } = useQuery({
    queryKey: [ACTIVITY_ANALYTICS_QUERY_KEY, activityId, fromDate, toDate],
    queryFn: async () => {
      const response = await activityApiService.getActivityAnalytics({
        activityId: activityId!,
        fromDate,
        toDate,
      });

      return response.success ? response.data : undefined;
    },
    // Skip when analytics were pre-loaded by the parent (batch fetch).
    enabled: !!activityId && !preloadedAnalytics,
    placeholderData: keepPreviousData,
  });

  const currentActiveMs =
    preloadedAnalytics?.currentActiveMs ??
    analytics?.totals?.activeDurationMs ??
    0;

  const analyticsFetchedAtMs =
    preloadedAnalytics?.fetchedAtMs ?? analyticsDataUpdatedAt;

  const displayedSeconds = useDisplayedSeconds({
    currentActiveMs,
    analyticsFetchedAtMs,
    hasActiveSession,
  });

  const displayedTime = useMemo(
    () => formatDurationLabel(displayedSeconds),
    [displayedSeconds],
  );

  return {
    displayedTime,
    sessionStatus: effectiveSessionStatus,
    hasActiveSession,
    isLoading: isLoadingAnalytics || isLoadingCurrentSession,
  };
}
