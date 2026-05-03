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
  onSelect?: (id: string, title: string, activeDurationMs: number) => void;
  onStart?: (activityId: ActivityDTO["id"]) => void;
  onPause?: (activityId: ActivityDTO["id"]) => void;
  onFinish?: (activityId: ActivityDTO["id"]) => void;
  hasMoreItems?: boolean;
  isLoadingMoreItems?: boolean;
  onLoadMoreItems?: () => void;
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
  isLoadingMoreItems = false,
  onLoadMoreItems,
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
          const mutedControls =
            Boolean(
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
                  freezeSelection
                    ? undefined
                    : () =>
                        onSelect?.(
                          activity.id,
                          activity.title,
                          activity.activeDurationMs,
                        )
                }
                onStart={() => onStart?.(activity.id)}
                onPause={() => onPause?.(activity.id)}
                onFinish={() => onFinish?.(activity.id)}
              />
            </ActivityListView.Item>
          );
        })}
      </ActivityListView>
      {hasMoreItems && onLoadMoreItems ? (
        <Button
          variant="ghost"
          size="sm"
          alignSelf="flex-start"
          loading={isLoadingMoreItems}
          disabled={isLoadingMoreItems}
          onClick={() => onLoadMoreItems()}
        >
          Ещё
        </Button>
      ) : null}
    </Box>
  );
}

ActivityGroup.Skeleton = Skeleton;
