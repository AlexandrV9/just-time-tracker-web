import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ActivityDTO } from "@to-do-list/shared";

import {
  ACTIVITY_ANALYTICS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { getDateIntervalByCalendarDay, type CalendarDay } from "~/shared/libs";

export function useGroupDayActiveTotalSeconds(
  calendarDay: CalendarDay,
  activities: ActivityDTO[],
): number {
  const { fromDate, toDate } = useMemo(
    () => getDateIntervalByCalendarDay(calendarDay),
    [calendarDay],
  );

  const analyticsResults = useQueries({
    queries: activities.map((activity) => ({
      queryKey: [ACTIVITY_ANALYTICS_QUERY_KEY, activity.id, fromDate, toDate],
      queryFn: async () => {
        const response = await activityApiService.getActivityAnalytics({
          activityId: activity.id,
          fromDate,
          toDate,
        });
        return response.success ? response.data : undefined;
      },
      placeholderData: keepPreviousData,
    })),
  });

  let totalSeconds = 0;

  for (let i = 0; i < activities.length; i++) {
    const dayActiveMs =
      analyticsResults[i]?.data?.totals?.activeDurationMs ?? 0;

    totalSeconds += Math.max(0, Math.floor(dayActiveMs / 1000));
  }

  return totalSeconds;
}
