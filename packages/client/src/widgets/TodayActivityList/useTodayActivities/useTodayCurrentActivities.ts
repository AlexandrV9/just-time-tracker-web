import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import {
  ACTIVITIES_CURRENT_QUERY_KEY,
  activityApiService,
  type ActivityState,
} from "~/shared/api/services";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";

export function useTodayCurrentActivities() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const todayCalendarDay = getCalendarDay();
  const { fromDate, toDate } = getDateIntervalByCalendarDay(todayCalendarDay);

  const query = useQuery({
    queryKey: [ACTIVITIES_CURRENT_QUERY_KEY, "today", userId, fromDate, toDate],
    queryFn: () =>
      activityApiService.getCurrentActivities({
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
                session: item.session,
                segment: item.segment,
              }) satisfies ActivityState,
          )
        : [],
  });

  return {
    currentActivities: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
