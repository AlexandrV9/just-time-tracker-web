import { EmptyState, List, VersionIcon } from "~/shared/ui";
import { ActivityCard } from "./ActivityCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "~/features/auth";
import { VStack } from "@chakra-ui/react";

export const ActivityList = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [ACTIVITIES_QUERY_KEY],
    queryFn: (ctx) =>
      activityApiService.getActivities({
        page: ctx.pageParam,
        limit: 20,
        createdById: userId!,
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

  useEffect(() => {
    if (isLastInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isLastInView, fetchNextPage, hasNextPage]);

  if (activities.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <VersionIcon size={60} />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>У вас пока нет активностей</EmptyState.Title>
            <EmptyState.Description>
              Создайте новую активность
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <List.Root
      display="grid"
      gap="1rem"
      gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
      listStyleType="none"
    >
      {activities.map((activity) => (
        <List.Item key={activity.id}>
          <ActivityCard activity={activity} />
        </List.Item>
      ))}
      <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
    </List.Root>
  );
};
