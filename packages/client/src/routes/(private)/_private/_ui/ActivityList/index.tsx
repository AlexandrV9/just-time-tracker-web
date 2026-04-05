import { Box } from "~/shared/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";
import { useTranslation } from "~/shared/hooks";
import { getLocalCalendarDayKey, groupByDate } from "~/shared/libs";
import { ActivityListDayGroup } from "./ActivityListDayGroup";
import { usePauseActivity } from "./usePauseActivity";
import { useStartActivity } from "./useStartActivity";
import { useFinishActivity } from "./useFinishActivity";

const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export const ActivityList = () => {
  const { i18n } = useTranslation();

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [ACTIVITIES_QUERY_KEY],
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
      ([dateKey, dayActivities]) => ({
        dateKey,
        activities: dayActivities,
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
      {groups.map((group) => (
        <ActivityListDayGroup
          key={group.dateKey}
          dateKey={group.dateKey}
          activities={group.activities}
          todayKey={todayKey}
          locale={i18n.language}
          onStart={startActivity}
          onPause={pauseActivity}
          onFinish={finishActivity}
        />
      ))}

      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </Box>
  );
};
