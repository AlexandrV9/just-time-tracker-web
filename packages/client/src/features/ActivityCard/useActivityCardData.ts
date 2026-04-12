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

type UseActivityCardDataProps = {
  activityId: ActivityDTO["id"];
  currentSessionId?: ActivitySessionDTO["id"] | null;
  calendarDay?: CalendarDay;
  activityStatus: ActivityStatusDTO;
};

export function useActivityCardData({
  activityId,
  currentSessionId,
  calendarDay,
  activityStatus,
}: UseActivityCardDataProps) {
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
    /**
     * Это время, когда данные стали актуальны в кэше React Query
     */
    dataUpdatedAt: analyticsFetchedAtMs,
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
    enabled: !!activityId,
    placeholderData: keepPreviousData,
  });

  const currentActiveMs = analytics?.totals?.activeDurationMs ?? 0;

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
    sessionStatus: currentSession?.status,
    hasActiveSession,
    isLoading: isLoadingAnalytics || isLoadingCurrentSession,
  };
}
