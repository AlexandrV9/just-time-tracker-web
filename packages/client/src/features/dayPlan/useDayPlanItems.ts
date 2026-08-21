import { useQuery } from "@tanstack/react-query";
import {
  DAY_PLAN_ITEMS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { useDayPlan } from "./useDayPlan";

/**
 * Получает списка запланированных событий-активностей
 */
export const useDayPlanItems = (date: Date) => {
  const dayPlanQuery = useDayPlan(date);
  const dayPlanId = dayPlanQuery.dayPlanId;

  const dayPlanItemsQuery = useQuery({
    queryKey: [DAY_PLAN_ITEMS_QUERY_KEY, dayPlanId],
    queryFn: () =>
      dayPlanApiService.getDayPlanItems({
        dayPlanId,
        page: 0,
        limit: 100,
      }),
    enabled: !!dayPlanId,
    select: (response) => (response.success ? response.data.data : []),
  });

  return {
    isLoading: dayPlanQuery.isLoading || dayPlanItemsQuery.isLoading,
    isError: dayPlanQuery.isError || dayPlanItemsQuery.isError,
    isFetching: dayPlanQuery.isFetching || dayPlanItemsQuery.isFetching,
    data: dayPlanItemsQuery.data ?? [],
  };
};
