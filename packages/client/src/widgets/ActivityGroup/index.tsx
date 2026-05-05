import type { ActivityDTO } from "@to-do-list/shared";
import { Box, Button, Flex, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { ActivityListView } from "~/entities/Activity";
import { ActivityCard } from "~/features";
import { Skeleton } from "./Skeleton";

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
  onSelect?: (activity: ActivityDTO) => void;
  onStart?: (activity: ActivityDTO) => void;
  onPause?: (activity: ActivityDTO) => void;
  onFinish?: (activity: ActivityDTO) => void;
  hasMoreItems?: boolean;
  isLoadingMoreGroupItems?: boolean;
  onLoadMoreGroupItems?: () => void;
};

export function ActivityGroup({
  data,
  onStart,
  onPause,
  onFinish,
  withControlButtons = false,
  selectedActivityId,
  onSelect,
  hasMoreItems = false,
  isLoadingMoreGroupItems = false,
  onLoadMoreGroupItems,
}: ActivityGroupProps) {
  const displayedActiveTotalTime = convertTimeObjectToTimeString(
    convertSecondsToTimeObject(data.totalActiveTime),
  );

  const runningActivityId = data.activities.find(
    (a) => a.status === "active",
  )?.id;

  const freezeSelection = Boolean(withControlButtons && runningActivityId);

  return (
    <Box display="flex" flexDirection="column" gap="0.75rem">
      <Flex justifyContent="space-between" alignItems="center" px={1}>
        <Text textStyle="sm" fontWeight="bold" color="fg.muted">
          {data.label}
        </Text>
        <Flex gap="0.25rem" alignItems="center">
          <Text textStyle="sm" color="fg.muted">
            Total:
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

          return (
            <ActivityListView.Item key={activity.id}>
              <ActivityCard
                activity={activity}
                activeDurationMs={activity.activeDurationMs}
                withControlButtons={withControlButtons}
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
          Загрузить еще
        </Button>
      ) : null}
    </Box>
  );
}

ActivityGroup.Skeleton = Skeleton;
