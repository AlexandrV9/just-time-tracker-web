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
import { ActivityGroup } from "../ActivityGroup";

export const ActivityHistory = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const { i18n } = useTranslation();

  const { ref: fetchRef, inView: isLastInView } = useInView();

  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [ACTIVITIES_QUERY_KEY, userId, "history", "day"],
      queryFn: ({ pageParam }) =>
        activityApiService.getGroupedActivities({
          groupBy: "day",
          limit: 8,
          cursor: pageParam ?? undefined,
          createdById: userId!,
          utcOffsetMinutes: -new Date().getTimezoneOffset(),
        }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        if (!lastPage?.success) return undefined;
        return lastPage.data.pagination.nextCursor ?? undefined;
      },
    });

  const groups = useMemo(() => {
    const groupList =
      data?.pages.flatMap((page) => (page.success ? page.data.groups : [])) ??
      [];


    const merged = new Map<
      string,
      {
        groupDateStart: string;
        groupDateEnd: string;
        totalActiveDurationMs: number;
        totalPauseDurationMs: number;
        items: ActivityDTO[];
      }
    >();

    for (const group of groupList) {
      const key = group.groupDateStart;

      if (!merged.has(key)) {
        merged.set(key, {
          groupDateStart: group.groupDateStart,
          groupDateEnd: group.groupDateEnd,
          totalActiveDurationMs: group.totalActiveDurationMs,
          totalPauseDurationMs: group.totalPauseDurationMs,
          items: [...group.items],
        });
      } else {
        merged.get(key)?.items.push(...group.items);
      }
    }

    return Array.from(merged.values())
      .sort(
        (a, b) =>
          new Date(b.groupDateStart).getTime() -
          new Date(a.groupDateStart).getTime(),
      )
      .map((group) => ({
        key: group.groupDateStart,
        label: formatGroupLabel({
          key: group.groupDateStart,
          groupBy: "day",
          locale: i18n.language,
        }),
        totalActiveTime: Math.floor(group.totalActiveDurationMs / 1000),
        activities: group.items,
        groupDateStart: group.groupDateStart,
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
    return <ActivityGroup.Skeleton />;
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
        <ActivityGroup key={group.key} data={group} />
      ))}
      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </Box>
  );
};
