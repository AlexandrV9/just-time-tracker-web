import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthStore } from "~/features/auth";
import {
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  ACTIVITIES_CURRENT_QUERY_KEY,
  ACTIVITIES_QUERY_KEY,
  activityApiService,
  DAY_PLAN_ITEMS_QUERY_KEY,
  DAY_PLANS_QUERY_KEY,
  dayPlanApiService,
  type ActivityGroup,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import {
  formatGroupLabel,
  getCalendarDay,
  getDateIntervalByCalendarDay,
} from "~/shared/libs";

export const useTodayActivities = (): {
  planId?: string;
  activityGroup: ActivityGroup;
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
    placeholderData: keepPreviousData,
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

  const overlappingCurrentQuery = useQuery({
    queryKey: [
      ACTIVITIES_CURRENT_QUERY_KEY,
      "todayOverlap",
      userId,
      todayCalendarDay,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      activityApiService.getCurrentActivities({
        createdById: userId!,
        fromDate,
        toDate,
        limit: 100,
        page: 0,
      }),
    enabled: !!userId,
    select: (response) =>
      response.success
        ? response.data.data.map((item) => ({
            activity: item.activity,
            session: item.session,
            segment: item.segment,
          }))
        : [],
  });
  const currentRows = useMemo(
    () => overlappingCurrentQuery.data ?? [],
    [overlappingCurrentQuery.data],
  );

  const currentById = useMemo(() => {
    const m = new Map<string, (typeof currentRows)[number]>();
    for (const row of currentRows) {
      m.set(row.activity.id, row);
    }
    return m;
  }, [currentRows]);

  const todayAnalyticsQuery = useQuery({
    queryKey: [
      ACTIVITIES_ANALYTICS_QUERY_KEY,
      fromDate,
      toDate,
      todayActivityIds,
    ],
    queryFn: async () => {
      const response = await activityApiService.getActivitiesAnalytics({
        activityIds: todayActivityIds,
        fromDate,
        toDate,
      });

      if (!response.success) {
        return undefined;
      }

      const itemsMap: Record<string, number> = {};
      let totalSeconds = 0;
      for (const [id, item] of Object.entries(response.data.items)) {
        itemsMap[id] = item.activeDurationMs;
        totalSeconds += Math.floor(item.activeDurationMs / 1000);
      }

      return { totalSeconds, itemsMap };
    },
    enabled: todayActivityIds.length > 0,
  });

  const analyticsItemsMap = todayAnalyticsQuery.data?.itemsMap ?? {};
  const activitiesToday = todayActivities.map((activity) => {
    const todayMs = analyticsItemsMap[activity.id];
    const activityWithMs =
      todayMs === undefined ? activity : { ...activity, activeDurationMs: todayMs };
    const cur = currentById.get(activity.id);
    return {
      activity: activityWithMs,
      session: cur?.session ?? undefined,
      segment: cur?.segment ?? undefined,
    };
  });

  const todayActivityIdSet = new Set(
    activitiesToday.map((row) => row.activity.id),
  );
  const appendedRows = currentRows.filter(
    (row) => !todayActivityIdSet.has(row.activity.id),
  );
  const mergedActivities = [...activitiesToday, ...appendedRows];

  const extraSecondsFromAppended = appendedRows.reduce(
    (acc, row) => acc + Math.floor(row.activity.activeDurationMs / 1000),
    0,
  );

  return {
    planId: todayPlanId,
    activityGroup: {
      label: formatGroupLabel({
        key: todayCalendarDay,
        groupBy: "day",
        locale: i18n.language,
      }),
      totalActiveTime:
        (todayAnalyticsQuery.data?.totalSeconds ?? 0) + extraSecondsFromAppended,
      activities: mergedActivities,
      activeTimerCalendarDay: todayCalendarDay,
    } satisfies ActivityGroup,
    isLoading:
      todayPlanActivitiesQuery.isLoading ||
      todayPlanItemsQuery.isLoading ||
      todayActivitiesQuery.isLoading ||
      todayAnalyticsQuery.isLoading ||
      overlappingCurrentQuery.isLoading,
    isError:
      todayPlanActivitiesQuery.isError ||
      todayPlanItemsQuery.isError ||
      todayActivitiesQuery.isError ||
      todayAnalyticsQuery.isError ||
      overlappingCurrentQuery.isError,
  };
};
