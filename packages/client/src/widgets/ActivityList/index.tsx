import {
  EmptyState,
  Flex,
  IconButton,
  PlusIcon,
  Stack,
  Text,
  VersionIcon,
} from "~/shared/ui";
import { ActivityCard } from "./ActivityCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";
import { useDialog, VStack } from "@chakra-ui/react";
import { useTranslation } from "~/shared/hooks";
import { CreateActivityDialog } from "./CreateActivityDialog";
import { ActivityListView } from "~/entities";

export const ActivityList = () => {
  const { t } = useTranslation();

  const createActivityDialog = useDialog();

  const { data, fetchNextPage, hasNextPage, isError, isPending } =
    useInfiniteQuery({
      queryKey: [ACTIVITIES_QUERY_KEY],
      queryFn: (ctx) =>
        activityApiService.getActivities({
          page: ctx.pageParam,
          limit: 20,
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

  const renderContent = () => {
    if (isPending) {
      return null;
    }

    if (isError) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <VersionIcon size={60} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {t("widgets.activityList.error")}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.activityList.errorDescription")}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    if (activities.length === 0) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <VersionIcon size={60} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {t("widgets.activityList.emptyTitle")}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.activityList.emptyDescription")}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    return (
      <ActivityListView>
        {activities.map((activity) => (
          <ActivityListView.Item key={activity.id}>
            <ActivityCard activity={activity} />
          </ActivityListView.Item>
        ))}
        <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
      </ActivityListView>
    );
  };

  return (
    <>
      <Stack.VStack w="full" p="0.5rem" alignItems="stretch">
        <Flex alignItems="center" gap="1rem" my="0.5rem">
          <Text textStyle="2xl" fontWeight="bolder">
            {t("widgets.activityList.title")}
          </Text>
          <IconButton
            aria-label={t("widgets.activityList.newActivityButton")}
            variant="outline"
            size="xs"
            onClick={() => createActivityDialog.setOpen(true)}
          >
            <PlusIcon size={22} />
          </IconButton>
        </Flex>
        {renderContent()}
      </Stack.VStack>
      <CreateActivityDialog dialog={createActivityDialog} />
    </>
  );
};
