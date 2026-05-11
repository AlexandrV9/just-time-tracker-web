import type { ActivityDTO } from "@to-do-list/shared";
import { Box, Button, Flex, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { ActivityListView } from "~/entities/Activity";
import { ActivityCard } from "~/features";
import { useCurrentActivityStore } from "~/features/hooks/useCurrentActivityStore";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useRef } from "react";
import { Skeleton } from "./Skeleton";
import { useTranslation } from "~/shared/hooks";

export type ActivityGroupDTO = {
  label: string;
  totalActiveTime: number;
  activities: ActivityDTO[];
  itemsHasMore?: boolean;
  itemsNextCursor?: string | null;
};

type ActivityGroupProps = {
  data: ActivityGroupDTO;
  withControlButtons?: boolean;
  selectedActivityId?: string;
  highlightedActivityId?: string;
  hasMoreItems?: boolean;
  isLoadingMoreGroupItems?: boolean;
  onSelect?: (activity: ActivityDTO) => void;
  onStart?: (activity: ActivityDTO) => void;
  onPause?: (activity: ActivityDTO) => void;
  onFinish?: (activity: ActivityDTO) => void;
  onLoadMoreGroupItems?: () => void;
};

export function ActivityGroup({
  data,
  onStart,
  onPause,
  onFinish,
  withControlButtons = false,
  selectedActivityId,
  highlightedActivityId,
  onSelect,
  hasMoreItems = false,
  isLoadingMoreGroupItems = false,
  onLoadMoreGroupItems,
}: ActivityGroupProps) {
  const { t } = useTranslation();

  const { currentActivity, currentSegment } = useCurrentActivityStore(
    useShallow((state) => ({
      currentActivity: state.currentActivity,
      currentSegment: state.currentSegment,
    })),
  );

  const highlightedItemRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (!highlightedActivityId || !highlightedItemRef.current) return;

    highlightedItemRef.current.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
  }, [highlightedActivityId]);

  const displayedActiveTotalTime = convertTimeObjectToTimeString(
    convertSecondsToTimeObject(data.totalActiveTime),
  );

  const runningActivityId = data.activities.find(
    (a) => a.status === "active",
  )?.id;

  const freezeSelection = Boolean(withControlButtons && runningActivityId);

  return (
    <Box display="flex" flexDirection="column" gap="0.75rem">
      <Flex justifyContent="space-between" alignItems="center" gap="0.5rem">
        <Text textStyle="sm" fontWeight="bold" color="fg.muted">
          {data.label}
        </Text>
        <Flex gap="0.25rem" alignItems="center" wrap="wrap" justify="flex-end">
          <Text textStyle="sm" color="fg.muted">
            {t("widgets.activityGroup.totalActiveTime")}:
          </Text>
          <Text
            textStyle="sm"
            fontWeight="bold"
            fontFamily="Roboto Mono, monospace"
          >
            {displayedActiveTotalTime}
          </Text>
        </Flex>
      </Flex>
      <ActivityListView>
        {data.activities.map((activity) => {
          const mutedControls = Boolean(
            withControlButtons &&
            runningActivityId &&
            activity.id !== runningActivityId,
          );

          const isCurrentActivity =
            withControlButtons &&
            currentActivity?.id === activity.id &&
            currentSegment?.type === "active";

          const isHighlighted = highlightedActivityId === activity.id;

          return (
            <ActivityListView.Item
              key={activity.id}
              ref={isHighlighted ? highlightedItemRef : undefined}
            >
              <ActivityCard
                activity={activity}
                activeDurationMs={activity.activeDurationMs}
                pauseDurationMs={activity.pauseDurationMs}
                activeSegmentStartedAt={
                  isCurrentActivity ? currentSegment.startedAt : null
                }
                isRunning={isCurrentActivity}
                isHighlighted={isHighlighted}
                withControlButtons={withControlButtons}
                showDurationBreakdown={!withControlButtons}
                mutedControls={mutedControls}
                isSelected={
                  !!selectedActivityId &&
                  activity.id === selectedActivityId &&
                  !freezeSelection
                }
                isInteractive={!freezeSelection}
                onClick={
                  freezeSelection ? undefined : () => onSelect?.(activity)
                }
                onStart={() => onStart?.(activity)}
                onPause={() => onPause?.(activity)}
                onFinish={() => onFinish?.(activity)}
              />
            </ActivityListView.Item>
          );
        })}
      </ActivityListView>
      {hasMoreItems && onLoadMoreGroupItems ? (
        <Button
          variant="outline"
          size="sm"
          alignSelf="flex-start"
          borderRadius="xl"
          loading={isLoadingMoreGroupItems}
          disabled={isLoadingMoreGroupItems}
          onClick={onLoadMoreGroupItems}
        >
          {t("widgets.activityGroup.loadMoreButton")}
        </Button>
      ) : null}
    </Box>
  );
}

ActivityGroup.Skeleton = Skeleton;
