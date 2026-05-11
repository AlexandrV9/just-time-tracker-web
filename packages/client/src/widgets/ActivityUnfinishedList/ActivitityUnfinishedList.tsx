import { useInfiniteQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { ActivityCard } from "~/features";
import { useAuthStore } from "~/features/auth";
import {
  ACTIVITIES_CURRENT_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";
import { Flex, List, Text } from "~/shared/ui";
import { useFinishActivity } from "../TodayActivityList/mutations/useFinishActivity";
import { useTranslation } from "~/shared/hooks";

const getEndOfYesterdayIso = () => {
  const yesterday = subDays(new Date(), 1);
  const { toDate } = getDateIntervalByCalendarDay(getCalendarDay(yesterday));
  return toDate;
};

/**
 * @deprecated Use useTodayActivities instead
 */
export const ActivitityUnfinishedList = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const userId = user?.id;

  const toDate = useMemo(() => getEndOfYesterdayIso(), []);

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [ACTIVITIES_CURRENT_QUERY_KEY, { toDate }],
    queryFn: (ctx) =>
      activityApiService.getCurrentActivities({
        toDate,
        limit: 20,
        page: ctx.pageParam,
        createdById: userId!,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.success && lastPage.data.pagination.hasNext) {
        return lastPage.data.pagination.page + 1;
      }
    },
    enabled: !!userId,
  });

  const { ref: fetchRef, inView: isLastInView } = useInView();

  useEffect(() => {
    if (isLastInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isLastInView, fetchNextPage, hasNextPage]);

  const activities = useMemo(
    () =>
      data?.pages.flatMap((d) =>
        (d.success ? d.data.data : []).map((item) => item.activity),
      ) ?? [],
    [data],
  );

  const { mutate: finishActivity } = useFinishActivity();

  const handleFinish = (activity: (typeof activities)[number]) => {
    finishActivity({
      activityId: activity.id,
      finishedAt: new Date().toISOString(),
    });
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <Flex direction="column" p="0.5rem" gap="1rem">
      <Text textStyle="lg" fontWeight="medium">
        {t("widgets.unfinishedActivities.title")}
      </Text>
      <List.Root
        display="grid"
        gap="1rem"
        gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
        listStyleType="none"
      >
        {activities.map((activity) => (
          <List.Item key={activity.id}>
            <ActivityCard
              activity={activity}
              activeDurationMs={activity.activeDurationMs}
              pauseDurationMs={activity.pauseDurationMs}
              showDurationBreakdown
              withControlButtons
              finishOnly
              isInteractive={false}
              onFinish={() => handleFinish(activity)}
            />
          </List.Item>
        ))}
        <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
      </List.Root>
    </Flex>
  );
};
