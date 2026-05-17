import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import {
  DAY_PLAN_ITEMS_QUERY_KEY,
  DAY_PLANS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { getCalendarDay } from "~/shared/libs";

export const useTodayPlanItems = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  const todayCalendarDay = getCalendarDay();

  const todayPlanQuery = useQuery({
    queryKey: [DAY_PLANS_QUERY_KEY, userId, todayCalendarDay],
    queryFn: () =>
      dayPlanApiService.getDayPlans({
        createdById: userId!,
        date: todayCalendarDay,
        page: 0,
        limit: 1,
      }),
    enabled: Boolean(userId),
    select: (response) => (response.success ? response.data.data[0] : null),
    placeholderData: keepPreviousData,
  });

  const todayPlanId = todayPlanQuery.data?.id;

  const todayPlanItemsQuery = useQuery({
    queryKey: [DAY_PLAN_ITEMS_QUERY_KEY, todayPlanId],
    queryFn: () =>
      dayPlanApiService.getDayPlanItems({
        dayPlanId: todayPlanId!,
        page: 0,
        limit: 100,
      }),
    enabled: Boolean(todayPlanId),
    select: (response) => (response.success ? response.data.data : []),
  });

  return {
    todayPlanId,
    todayPlanItems: todayPlanItemsQuery.data ?? [],
    isLoading: todayPlanQuery.isLoading || todayPlanItemsQuery.isLoading,
    isError: todayPlanQuery.isError || todayPlanItemsQuery.isError,
  };
};
