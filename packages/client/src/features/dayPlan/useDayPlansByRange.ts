import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import { DAY_PLANS_QUERY_KEY, dayPlanApiService } from "~/shared/api/services";

type UseDayPlansByRangeParams = {
  fromDate: string;
  toDate: string;
  enabled?: boolean;
};

/**
 * Активности плана дня по диапазону дат.
 * Возвращает Map date -> count для маркеров в календаре.
 */
export const useDayPlansByRange = ({
  fromDate,
  toDate,
  enabled = true,
}: UseDayPlansByRangeParams) => {
  const userId = useAuthStore((state) => state.user?.id);

  const query = useQuery({
    queryKey: [DAY_PLANS_QUERY_KEY, userId, "by-range", fromDate, toDate],
    queryFn: () => dayPlanApiService.getDayPlansByRange({ fromDate, toDate }),
    enabled: Boolean(userId) && enabled && Boolean(fromDate) && Boolean(toDate),
    select: (response) => (response.success ? response.data : []),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const activityCountByDate = useMemo(() => {
    const map = new Map<string, number>();

    for (const day of query.data ?? []) {
      map.set(day.date, day.activities.length);
    }

    return map;
  }, [query.data]);

  return {
    days: query.data ?? [],
    activityCountByDate,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    dataUpdatedAt: query.dataUpdatedAt,
  };
};
