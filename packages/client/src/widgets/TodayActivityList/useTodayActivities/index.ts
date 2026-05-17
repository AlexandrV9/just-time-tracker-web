import { useMemo } from "react";
import { type ActivityGroup } from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import {
  formatGroupLabel,
  getCalendarDay,
  getDateIntervalByCalendarDay,
} from "~/shared/libs";
import { useTodayPlanItems } from "./useTodayPlanItems";
import { useTodayPlanActivities } from "./useTodayPlanActivities";
import { useTodayCurrentActivities } from "./useTodayCurrentActivities";
import { useTodayAnalytics } from "./useTodayAnalytics";
import { buildTodayActivityRows } from "./buildTodayActivityRows";

export const useTodayActivities = (): {
  planId?: string;
  activityGroup: ActivityGroup;
  isLoading: boolean;
  isError: boolean;
} => {
  const { i18n } = useTranslation();

  const todayCalendarDay = getCalendarDay();
  const { fromDate, toDate } = getDateIntervalByCalendarDay(todayCalendarDay);

  const {
    todayPlanId,
    todayPlanItems,
    isLoading: todayPlanItemsLoading,
    isError: todayPlanItemsError,
  } = useTodayPlanItems();

  const todayPlanItemIds = todayPlanItems.map(
    (planItem) => planItem.activityId,
  );

  const {
    todayPlanActivities,
    isLoading: todayPlanActivitiesLoading,
    isError: todayPlanActivitiesError,
  } = useTodayPlanActivities({
    activityIds: todayPlanItemIds,
  });

  const {
    currentActivities,
    isLoading: currentActivitiesLoading,
    isError: currentActivitiesError,
  } = useTodayCurrentActivities();

  const analyticsActivityIds = useMemo(() => {
    return [
      ...new Set([
        ...todayPlanItemIds,
        ...currentActivities.map((item) => item.activity.id),
      ]),
    ].sort();
  }, [todayPlanItemIds, currentActivities]);

  const {
    analytics: todayAnalytics,
    isSuccess: todayAnalyticsSuccess,
    isLoading: todayAnalyticsLoading,
    isError: todayAnalyticsError,
  } = useTodayAnalytics({
    activityIds: analyticsActivityIds,
    fromDate,
    toDate,
  });

  const mergedActivities = useMemo(
    () =>
      buildTodayActivityRows({
        planActivities: todayPlanActivities,
        currentActivities,
        analyticsItemsMap: todayAnalytics?.itemsMap ?? {},
      }),

    [todayPlanActivities, currentActivities, todayAnalytics?.itemsMap],
  );

  return {
    planId: todayPlanId,
    activityGroup: {
      label: formatGroupLabel({
        key: todayCalendarDay,
        groupBy: "day",
        locale: i18n.language,
      }),
      totalActiveTime: todayAnalyticsSuccess ? todayAnalytics.totalSeconds : 0,
      activities: mergedActivities,
      activeTimerCalendarDay: todayCalendarDay,
    } satisfies ActivityGroup,
    isLoading:
      todayPlanItemsLoading ||
      todayPlanActivitiesLoading ||
      todayAnalyticsLoading ||
      currentActivitiesLoading,
    isError:
      todayPlanItemsError ||
      todayPlanActivitiesError ||
      todayAnalyticsError ||
      currentActivitiesError,
  };
};
