import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import {
  ACTIVITIES_TRACKED_QUERY_KEY,
  activityApiService,
  type ActivityState,
} from "~/shared/api/services";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";

export function useTodayTrackedActivities() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const todayCalendarDay = getCalendarDay();
  const { fromDate, toDate } = getDateIntervalByCalendarDay(todayCalendarDay);

  const query = useQuery({
    queryKey: [ACTIVITIES_TRACKED_QUERY_KEY, "today", userId, fromDate, toDate],
    queryFn: () =>
      activityApiService.getTrackedActivities({
        createdById: userId!,
        fromDate,
        toDate,
        limit: 100,
        page: 0,
      }),
    enabled: Boolean(userId),
    select: (response) =>
      response.success
        ? response.data.data.map(
            (item) =>
              ({
                activity: item.activity,
                session: null,
                segment: null,
              }) satisfies ActivityState,
          )
        : [],
  });

  return {
    trackedActivities: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
