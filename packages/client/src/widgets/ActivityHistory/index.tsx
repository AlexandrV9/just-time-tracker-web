import type { ActivityDTO } from "@to-do-list/shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useAuthStore } from "~/features/auth";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { formatGroupLabel } from "~/shared/libs";
import { Box, EmptyState, VersionIcon } from "~/shared/ui";
import { VStack } from "@chakra-ui/react";
import { ActivityGroupListItem } from "../ActivityGroupList/ActivityGroupListItem";

export const ActivityHistory = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const { i18n } = useTranslation();

  const { ref: fetchRef, inView: isLastInView } = useInView();

  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [ACTIVITIES_QUERY_KEY, userId, "history"],
      queryFn: ({ pageParam }) =>
        activityApiService.getActivitiesGroupedByDay({
          page: pageParam,
          limit: 7,
          createdById: userId!,
        }),
      enabled: !!userId,
      initialPageParam: 0,
      getNextPageParam: (lastGroup) => {
        if (lastGroup?.success && lastGroup.data.pagination.hasNext) {
          return lastGroup.data.pagination.page + 1;
        }
        return undefined;
      },
    });

  const groups = useMemo(() => {
    const allEntries =
      data?.pages.flatMap((page) =>
        page.success ? Object.entries(page.data.data) : [],
      ) ?? [];

    const merged = new Map<string, ActivityDTO[]>();

    for (const [day, activities] of allEntries) {
      if (!merged.has(day)) {
        merged.set(day, []);
      }
      merged.get(day)!.push(...activities);
    }

    return Array.from(merged.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([calendarDay, activities]) => ({
        data: {
          label: formatGroupLabel({
            key: calendarDay,
            groupBy: "day",
            locale: i18n.language,
          }),
          totalActiveTime: activities.reduce(
            (sum, a) => sum + Math.floor(a.activeDurationMs / 1000),
            0,
          ),
          activities,
        },
        calendarDay,
      }));
  }, [data, i18n.language]);

  useEffect(() => {
    if (isLastInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isLastInView, fetchNextPage, hasNextPage]);

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return <ActivityGroupListItem.Skeleton />;
  }

  if (isError) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <VersionIcon size={60} />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Не удалось загрузить историю</EmptyState.Title>
            <EmptyState.Description>
              Попробуйте перезагрузить страницу
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <VersionIcon size={60} />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Пока нет активностей</EmptyState.Title>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="1.5rem">
      {groups.map((group) => (
        <ActivityGroupListItem key={group.calendarDay} data={group.data} />
      ))}
      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </Box>
  );
};
