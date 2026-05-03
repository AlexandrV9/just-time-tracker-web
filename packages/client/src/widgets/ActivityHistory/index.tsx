import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";
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
import { formatActivityGroups } from "./utils";

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

  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [ACTIVITIES_QUERY_KEY, userId, "history", "day"],
      queryFn: ({ pageParam }) =>
        activityApiService.getGroupedActivities({
          groupBy: "day",
          groupLimit: 5,
          itemsLimit: 8,
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
        <ActivityGroup
          key={group.key}
          data={group}
          onSelect={(id) => handleSelectActivity(id)}
        />
      ))}
      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </Box>
  );
};
