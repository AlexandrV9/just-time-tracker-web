import { useQuery } from "@tanstack/react-query";
import type { ActivityDTO } from "@to-do-list/shared";
import { useAuthStore } from "~/features/auth";
import {
  ACTIVITIES_QUERY_KEY,
  ACTIVITY_BATCH_ANALYTICS_QUERY_KEY,
  activityApiService,
  DAY_PLAN_ITEMS_QUERY_KEY,
  DAY_PLANS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import {
  formatGroupLabel,
  getCalendarDay,
  getDateIntervalByCalendarDay,
} from "~/shared/libs";

type ActivityGroupDTO = {
  label: string;
  totalActiveTime: number;
  activities: ActivityDTO[];
};

export const useTodayActivities = (): {
  planId?: string;
  activityGroup: ActivityGroupDTO;
  isLoading: boolean;
  isError: boolean;
} => {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();
  const userId = user?.id;

  const todayCalendarDay = getCalendarDay();
  const { fromDate, toDate } = getDateIntervalByCalendarDay(todayCalendarDay);

  const todayPlanActivitiesQuery = useQuery({
    queryKey: [DAY_PLANS_QUERY_KEY, userId, todayCalendarDay],
    queryFn: () =>
      dayPlanApiService.getDayPlans({
        createdById: userId!,
        date: todayCalendarDay,
        page: 0,
        limit: 1,
      }),
    enabled: !!userId,
    select: (response) => (response.success ? response.data : undefined),
  });

  const todayPlan = todayPlanActivitiesQuery.data?.data?.[0];
  const todayPlanId = todayPlan?.id;

  const todayPlanItemsQuery = useQuery({
    queryKey: [DAY_PLAN_ITEMS_QUERY_KEY, todayPlanId],
    queryFn: () =>
      dayPlanApiService.getDayPlanItems({
        dayPlanId: todayPlanId!,
        page: 0,
        limit: 100,
      }),
    enabled: !!todayPlanId,
    select: (response) => (response.success ? response.data : undefined),
  });
  const todayPlanItems = todayPlanItemsQuery.data?.data;
  const todayActivityIds =
    todayPlanItems?.map((planItem) => planItem.activityId) ?? [];

  const todayActivitiesQuery = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, userId, fromDate, toDate, todayPlanItems],
    queryFn: () =>
      activityApiService.getActivitiesByIds({
        activityIds: todayActivityIds,
      }),
    enabled: todayActivityIds?.length !== 0,
    select: (response) => (response.success ? response.data : []),
  });
  const todayActivities = todayActivitiesQuery.data ?? [];

  const todayAnalyticsQuery = useQuery({
    queryKey: [
      ACTIVITY_BATCH_ANALYTICS_QUERY_KEY,
      fromDate,
      toDate,
      todayActivityIds,
    ],
    queryFn: async () => {
      const response = await activityApiService.getBatchActivityAnalytics({
        activityIds: todayActivityIds,
        fromDate,
        toDate,
      });

      if (!response.success) {
        return undefined;
      }

      console.log("response.data.items", response.data.items);

      return Object.values(response.data.items).reduce((acc, item) => {
        acc += Math.floor(item.totals.activeDurationMs / 1000);
        return acc;
      }, 0);
    },
    enabled: todayActivityIds.length > 0,
  });

  return {
    planId: todayPlanId,
    activityGroup: {
      label: formatGroupLabel({
        key: todayCalendarDay,
        groupBy: "day",
        locale: i18n.language,
      }),
      totalActiveTime: todayAnalyticsQuery.data ?? 0,
      activities: todayActivities,
    } satisfies ActivityGroupDTO,
    isLoading:
      todayPlanActivitiesQuery.isLoading ||
      todayPlanItemsQuery.isLoading ||
      todayActivitiesQuery.isLoading ||
      todayAnalyticsQuery.isLoading,
    isError:
      todayPlanActivitiesQuery.isError ||
      todayPlanItemsQuery.isError ||
      todayActivitiesQuery.isError ||
      todayAnalyticsQuery.isError,
  };
};
