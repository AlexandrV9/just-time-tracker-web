import { Box } from "~/shared/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";
import { useTranslation } from "~/shared/hooks";
import {
  getLocalCalendarDay,
  groupByDate,
  type CalendarDay,
} from "~/shared/libs";
import { useAuthStore } from "~/features/auth";
import { ActivityGroupListItem } from "./ActivityGroupListItem";
import { usePauseActivity } from "./mutations/usePauseActivity";
import { useStartActivity } from "./mutations/useStartActivity";
import { useFinishActivity } from "./mutations/useFinishActivity";

export const ActivityGroupList = () => {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();

  const userId = user?.id;

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, userId],
    queryFn: (ctx) =>
      activityApiService.getActivities({
        page: ctx.pageParam,
        limit: 20,
        createdById: userId!,
        sortBy: "updatedAt",
        sortOrder: "desc",
      }),
    enabled: !!userId,
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
    return Object.entries(groupByDate(activities, "day", (a) => a.updatedAt)).map(
      ([calendarDay, dayActivities]) => ({
        calendarDay: calendarDay as CalendarDay,
        activities: dayActivities,
      }),
    );
  }, [activities]);
  const todayKey = getLocalCalendarDay(new Date());

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
        <ActivityGroupListItem
          key={group.calendarDay}
          calendarDay={group.calendarDay}
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
