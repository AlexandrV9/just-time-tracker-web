import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ActivityDTO } from "@to-do-list/shared";

import {
  ACTIVITY_BATCH_ANALYTICS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { getDateIntervalByCalendarDay, type CalendarDay } from "~/shared/libs";

export type ActivityAnalyticsEntry = {
  currentActiveMs: number;
  fetchedAtMs: number;
};

export function useGroupAnalytics(
  calendarDay: CalendarDay,
  activities: ActivityDTO[],
): {
  totalSeconds: number;
  analyticsMap: Record<string, ActivityAnalyticsEntry>;
  isFetched: boolean;
} {
  const { fromDate, toDate } = useMemo(
    () => getDateIntervalByCalendarDay(calendarDay),
    [calendarDay],
  );

  const activityIds = useMemo(
    () => activities.map((a) => a.id),
    [activities],
  );

  const { data, dataUpdatedAt, isFetched } = useQuery({
    queryKey: [ACTIVITY_BATCH_ANALYTICS_QUERY_KEY, activityIds, fromDate, toDate],
    queryFn: async () => {
      const response = await activityApiService.getBatchActivityAnalytics({
        activityIds,
        fromDate,
        toDate,
      });
      return response.success ? response.data : undefined;
    },
    enabled: activityIds.length > 0,
    placeholderData: keepPreviousData,
  });

  return useMemo(() => {
    const items = data?.items ?? {};

    let totalSeconds = 0;
    const analyticsMap: Record<string, ActivityAnalyticsEntry> = {};

    for (const activity of activities) {
      const entry = items[activity.id];
      const currentActiveMs = entry?.totals?.activeDurationMs ?? 0;

      totalSeconds += Math.max(0, Math.floor(currentActiveMs / 1000));
      analyticsMap[activity.id] = { currentActiveMs, fetchedAtMs: dataUpdatedAt };
    }

    return { totalSeconds, analyticsMap, isFetched };
  }, [data, dataUpdatedAt, activities, isFetched]);
}
