import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
  DAY_PLAN_ITEMS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { useDayPlan } from "./useDayPlan";

/**
 * Получает список запланированных активностей конкретного дня.
 */
export const useDayPlanActivities = (date: Date) => {
  const dayPlanQuery = useDayPlan(date);

  const dayPlanId = dayPlanQuery.data?.id;
  const hasPlan = dayPlanId != null;

  const dayPlanItemsQuery = useQuery({
    queryKey: [DAY_PLAN_ITEMS_QUERY_KEY, dayPlanId],
    queryFn: () =>
      dayPlanApiService.getDayPlanItems({
        dayPlanId: dayPlanId!,
        page: 0,
        limit: 100,
      }),
    enabled: hasPlan,
    select: (response) => (response.success ? response.data.data : []),
  });

  const plannedActivityIds =
    dayPlanItemsQuery.data?.map((item) => item.activityId) ?? [];

  const hasPlannedActivities = plannedActivityIds.length > 0;

  const plannedActivitiesQuery = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, "byIds", plannedActivityIds],
    queryFn: () =>
      activityApiService.getActivitiesByIds({
        activityIds: plannedActivityIds,
      }),
    enabled: hasPlannedActivities,
    select: (response) => (response.success ? response.data : []),
  });

  const isError =
    dayPlanQuery.isError ||
    dayPlanItemsQuery.isError ||
    plannedActivitiesQuery.isError;

  const isDayPlanResolved = dayPlanQuery.isSuccess;

  const areDayPlanItemsResolved =
    isDayPlanResolved && (!hasPlan || dayPlanItemsQuery.isSuccess);

  const areActivitiesResolved =
    areDayPlanItemsResolved &&
    (!hasPlannedActivities || plannedActivitiesQuery.isSuccess);

  const isLoading = !areActivitiesResolved && !isError;

  const isFetching =
    dayPlanQuery.isFetching ||
    dayPlanItemsQuery.isFetching ||
    plannedActivitiesQuery.isFetching;

  const plannedActivities = areActivitiesResolved
    ? (plannedActivitiesQuery.data ?? [])
    : [];

  const refetchDayPlan = dayPlanQuery.refetch;
  const refetchDayPlanItems = dayPlanItemsQuery.refetch;

  const refetch = useCallback(async () => {
    const dayPlanResult = await refetchDayPlan();

    if (!dayPlanResult.data?.id) {
      return;
    }

    await refetchDayPlanItems();
  }, [refetchDayPlan, refetchDayPlanItems]);

  return {
    plannedActivities,
    isLoading,
    isError,
    isFetching,
    isEmpty: areActivitiesResolved && plannedActivities.length === 0,
    refetch,
  };
};
