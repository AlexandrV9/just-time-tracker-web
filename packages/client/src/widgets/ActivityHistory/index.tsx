import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ActivityDTO } from "@to-do-list/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAuthStore } from "~/features/auth";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { Box, EmptyState, VersionIcon } from "~/shared/ui";
import { VStack } from "@chakra-ui/react";
import { ActivityGroup } from "../ActivityGroup";
import { formatActivityGroups, rowToActivityForGroup } from "./utils";

const ITEMS_PAGE_SIZE = 2;

type GroupItemsExtra = {
  activities: ActivityDTO[];
  hasMore: boolean;
  nextCursor: string | null;
};

export const ActivityHistory = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const handleSelectActivity = useCallback(
    (activityId: string) => {
      navigate({
        to: "/activities/$activityId",
        params: { activityId },
      });
    },
    [navigate],
  );

  const { ref: fetchRef, inView: isLastInView } = useInView();

  const [extraItemsByGroup, setExtraItemsByGroup] = useState<
    Record<string, GroupItemsExtra>
  >({});
  const [loadingMoreGroupKey, setLoadingMoreGroupKey] = useState<string | null>(
    null,
  );
  const extraItemsRef = useRef(extraItemsByGroup);
  extraItemsRef.current = extraItemsByGroup;

  /** Нижняя граница интервала для первого запроса; в курсоре групп сервер сохраняет тот же `fromDate`. */
  const historyFromDate = useMemo(() => {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - 90);
    from.setUTCHours(0, 0, 0, 0);
    return from.toISOString();
  }, []);

  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [ACTIVITIES_QUERY_KEY, userId, "history", "day", historyFromDate],
      queryFn: ({ pageParam }) =>
        activityApiService.getGroupedActivities({
          groupBy: "day",
          groupLimit: 5,
          itemsLimit: ITEMS_PAGE_SIZE,
          fromDate: historyFromDate,
          groupCursor: pageParam ?? undefined,
          createdById: userId!,
        }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        if (!lastPage?.success) return undefined;
        return lastPage.data.groupsPagination.nextCursor ?? undefined;
      },
    });

  const groups = useMemo(() => {
    return formatActivityGroups(
      data?.pages.flatMap((page) => (page.success ? page.data.groups : [])) ??
        [],
      i18n.language,
    );
  }, [data?.pages, i18n.language]);

  const handleLoadMoreItems = useCallback(
    async (groupKey: string) => {
      if (!userId) return;
      const base = groups.find((g) => g.key === groupKey);
      if (!base) return;
      const cursor =
        extraItemsRef.current[groupKey]?.nextCursor ?? base.itemsNextCursor;
      if (!cursor) return;

      setLoadingMoreGroupKey(groupKey);
      try {
        const res = await activityApiService.getGroupedActivityItems({
          createdById: userId,
          cursor,
          limit: ITEMS_PAGE_SIZE,
        });
        if (!res.success) return;

        setExtraItemsByGroup((prev) => {
          const prevExtra = prev[groupKey];
          const appended = res.data.items.map(rowToActivityForGroup);
          return {
            ...prev,
            [groupKey]: {
              activities: [...(prevExtra?.activities ?? []), ...appended],
              hasMore: res.data.pagination.hasNext,
              nextCursor: res.data.pagination.nextCursor,
            },
          };
        });
      } finally {
        setLoadingMoreGroupKey(null);
      }
    },
    [userId, groups],
  );

  useEffect(() => {
    if (isLastInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isLastInView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    setExtraItemsByGroup({});
  }, [userId, historyFromDate]);

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
      {groups.map((group) => {
        const extra = extraItemsByGroup[group.key];
        const activities = [
          ...group.activities,
          ...(extra?.activities ?? []),
        ];
        const hasMore = extra
          ? extra.hasMore
          : Boolean(group.itemsHasMore && group.itemsNextCursor);
        const nextCursor = extra?.nextCursor ?? group.itemsNextCursor ?? null;
        const showLoadMore = hasMore && nextCursor !== null;

        return (
          <ActivityGroup
            key={group.key}
            data={{ ...group, activities }}
            hasMoreItems={showLoadMore}
            isLoadingMoreItems={loadingMoreGroupKey === group.key}
            onLoadMoreItems={
              showLoadMore
                ? () => void handleLoadMoreItems(group.key)
                : undefined
            }
            onSelect={(id) => handleSelectActivity(id)}
          />
        );
      })}
      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </Box>
  );
};
