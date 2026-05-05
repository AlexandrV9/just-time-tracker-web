import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useAuthStore } from "~/features/auth";
import { Box, EmptyState, VersionIcon } from "~/shared/ui";
import { VStack } from "@chakra-ui/react";
import { ActivityGroup } from "../ActivityGroup";
import { useActivityHistory } from "./useActivityHistory";

export const ActivityHistory = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
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

  const {
    groups,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    loadMoreGroupItems,
    isLoadingMoreGroupItems,
  } = useActivityHistory(userId ?? "");

  const { ref: fetchRef, inView: isLastInView } = useInView();

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
          hasMoreItems={Boolean(group.itemsHasMore && group.itemsNextCursor)}
          isLoadingMoreGroupItems={isLoadingMoreGroupItems(group.key)}
          onLoadMoreGroupItems={() => loadMoreGroupItems(group.key)}
          onSelect={(activity) => handleSelectActivity(activity.id)}
        />
      ))}
      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </Box>
  );
};
