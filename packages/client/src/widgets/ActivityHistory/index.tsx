import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAuthStore } from "~/features/auth";
import { Box, EmptyState, Flex, Text, VersionIcon } from "~/shared/ui";
import { VStack } from "@chakra-ui/react";
import { useActivityHistory } from "./useActivityHistory";
import { useTranslation } from "~/shared/hooks";
import { HistoryActivityGroup } from "./HistoryActivityGroup";

export const ActivityHistory = () => {
  const { t } = useTranslation();

  const { user } = useAuthStore();
  const userId = user?.id;
  const navigate = useNavigate();

  const { highlight, highlightDate } = useSearch({
    from: "/(private)/_private/history/",
  });

  const [stableHighlightId, setStableHighlightId] = useState<
    string | undefined
  >(() => highlight);

  const [stableHighlightDate, setStableHighlightDate] = useState<
    string | undefined
  >(() => highlightDate);

  useEffect(() => {
    if (!highlight) return;
    setStableHighlightId(highlight);
    setStableHighlightDate(highlightDate);
    navigate({
      to: "/history",
      search: {},
      replace: true,
    });
  }, [highlight, highlightDate, navigate]);

  const handleSelectActivity = useCallback(
    (activityId: string, groupDateStart: string) => {
      navigate({
        to: "/activities/$activityId",
        params: { activityId },
        search: { date: groupDateStart },
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
  } = useActivityHistory();

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
    return <HistoryActivityGroup.Skeleton />;
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
              {t("widgets.activityHistory.error")}
            </EmptyState.Title>
            <EmptyState.Description>
              {t("widgets.activityHistory.errorDescription")}
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
            <EmptyState.Title>
              {t("widgets.activityHistory.empty")}
            </EmptyState.Title>
            <EmptyState.Description>
              {t("widgets.activityHistory.emptyDescription")}
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <Flex flexDirection="column" gap="1rem" p="0.5rem">
      <Text textStyle="2xl" fontWeight="bolder">
        {t("widgets.activityHistory.title")}
      </Text>
      <Box display="flex" flexDirection="column" gap="1.5rem">
        {groups.map((group) => (
          <HistoryActivityGroup
            key={group.key}
            data={group}
            highlightedActivityId={
              group.groupDateStart === stableHighlightDate
                ? stableHighlightId
                : undefined
            }
            hasMoreItems={Boolean(group.itemsHasMore && group.itemsNextCursor)}
            isLoadingMoreGroupItems={isLoadingMoreGroupItems(group.key)}
            onLoadMoreGroupItems={() => loadMoreGroupItems(group.key)}
            onSelect={(data) =>
              handleSelectActivity(data.activity.id, group.groupDateStart)
            }
          />
        ))}
        <div ref={fetchRef} style={{ height: 1, width: "100%" }} />
      </Box>
    </Flex>
  );
};
