import { Box, Flex, List, Text } from "~/shared/ui";
import { ActivityCard } from "./ActivityCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  activityApiService,
  ACTIVITYES_QUERY_KEY,
} from "~/shared/api/services";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";
import { useTranslation } from "~/shared/hooks";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  formatGroupLabel,
  getLocalCalendarDayKey,
  groupByDate,
} from "~/shared/libs";
import { usePauseActivity } from "./usePauseActivity";
import { useStartActivity } from "./useStartActivity";
import { useFinishActivity } from "./useFinishActivity";

const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export const ActivityList = () => {
  const { i18n } = useTranslation();

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [ACTIVITYES_QUERY_KEY],
    queryFn: (ctx) =>
      activityApiService.getActivities({
        page: ctx.pageParam,
        limit: 20,
        createdById: DEMO_USER_ID,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastGroup) => {
      if (lastGroup?.success && lastGroup.data.pagination.hasNext) {
        return lastGroup.data.pagination.page + 1;
      }
    },
  });

  const { ref: fetchRef, inView: isLastInView } = useInView();

  const activities = useMemo(
    () => data?.pages.flatMap((d) => (d.success ? d.data.data : [])) ?? [],
    [data],
  );

  const groups = useMemo(() => {
    return Object.entries(groupByDate(activities, "day")).map(
      ([dateKey, activities]) => ({
        dateKey,
        label: dateKey,
        totalSeconds: activities.reduce(
          (sum, item) => sum + Math.floor(item.activeDurationMs / 1000),
          0,
        ),
        activities,
      }),
    );
  }, [activities]);
  const todayKey = getLocalCalendarDayKey(new Date());

  const { mutateAsync: startActivity } = useStartActivity();
  const { mutateAsync: pauseActivity } = usePauseActivity();
  const { mutateAsync: finishActivity } = useFinishActivity();

  useEffect(() => {
    if (isLastInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isLastInView, fetchNextPage, hasNextPage]);

  return (
    <Box display="flex" flexDirection="column" gap="1.5rem">
      {groups.map((group) => {
        const totalTime = convertTimeObjectToTimeString(
          convertSecondsToTimeObject(group.totalSeconds),
        );

        return (
          <Box
            key={group.dateKey}
            display="flex"
            flexDirection="column"
            gap="0.75rem"
          >
            <Flex justifyContent="space-between" alignItems="center" px={1}>
              <Text textStyle="sm" fontWeight="bold" color="fg.muted">
                {formatGroupLabel({
                  key: group.dateKey,
                  groupBy: "day",
                  locale: i18n.language,
                })}
              </Text>
              <Flex gap="0.25rem" alignItems="center">
                <Text textStyle="sm" color="fg.muted">
                  Total:
                </Text>
                <Text
                  textStyle="sm"
                  fontWeight="bold"
                  fontFamily="Roboto Mono, monospace"
                >
                  {totalTime}
                </Text>
              </Flex>
            </Flex>

            <List.Root
              listStyleType="none"
              w="full"
              gap="0.75rem"
              display="grid"
              gridTemplateColumns="repeat(2, minmax(0, 1fr))"
              alignItems="stretch"
            >
              {group.activities.map((activity) => {
                return (
                  <List.Item
                    key={activity.id}
                    display="flex"
                    minH="0"
                    alignSelf="stretch"
                  >
                    <ActivityCard
                      activity={activity}
                      dayKey={group.dateKey}
                      showControlButtons={group.dateKey === todayKey}
                      onStart={startActivity}
                      onPause={pauseActivity}
                      onFinish={finishActivity}
                    />
                  </List.Item>
                );
              })}
            </List.Root>
          </Box>
        );
      })}

      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </Box>
  );
};
