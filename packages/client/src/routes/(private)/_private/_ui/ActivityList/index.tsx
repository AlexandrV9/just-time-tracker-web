import { Box, Flex, List, Text } from "~/shared/ui";
import { ActivityCard } from "./ActivityCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  activityApiService,
  ACTIVITYES_QUERY_KEY,
} from "~/shared/api/services";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";
import { type ActivityDTO } from "@to-do-list/shared";
import { useTranslation } from "~/shared/hooks";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { usePauseActivity } from "./usePauseActivity";
import { useStartActivity } from "./useStartActivity";
import { useFinishActivity } from "./useFinishActivity";

const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

type DateGroup = {
  dateKey: string;
  label: string;
  totalSeconds: number;
  activities: ActivityDTO[];
};

/** Total wall time tracked across all sessions (active + pause intervals). */
const getTotalTrackedSeconds = (a: ActivityDTO): number =>
  Math.floor((a.activeDurationMs + a.pauseDurationMs) / 1000);

const formatDateLabel = (dateStr: string, locale: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  const intlLocale = locale === "ru" ? "ru-RU" : "en-US";
  return date.toLocaleDateString(intlLocale, {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
};

const groupByDate = (activities: ActivityDTO[]): DateGroup[] => {
  const map = new Map<string, ActivityDTO[]>();

  for (const activity of activities) {
    const dateKey = new Date(activity.createdAt).toISOString().split("T")[0];
    const group = map.get(dateKey);
    if (group) {
      group.push(activity);
    } else {
      map.set(dateKey, [activity]);
    }
  }

  return Array.from(map.entries()).map(([dateKey, items]) => ({
    dateKey,
    label: dateKey,
    totalSeconds: items.reduce((sum, a) => sum + getTotalTrackedSeconds(a), 0),
    activities: items,
  }));
};

type ActivityListProps = {
  linkedActivityId?: string | null;
  linkedSeconds?: number;
};

export const ActivityList = ({
  linkedActivityId = null,
  linkedSeconds = 0,
}: ActivityListProps) => {
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

  const groups = useMemo(() => groupByDate(activities), [activities]);

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
                {formatDateLabel(group.dateKey, i18n.language)}
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
              {group.activities.map((activity) => (
                <List.Item
                  key={activity.id}
                  display="flex"
                  minH="0"
                  alignSelf="stretch"
                >
                  <ActivityCard
                    activity={activity}
                    dayKey={group.dateKey}
                    linkedActivityId={linkedActivityId}
                    linkedSeconds={linkedSeconds}
                    onStart={startActivity}
                    onPause={pauseActivity}
                    onFinish={finishActivity}
                  />
                </List.Item>
              ))}
            </List.Root>
          </Box>
        );
      })}

      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </Box>
  );
};
