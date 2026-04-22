import type { ActivityDTO } from "@to-do-list/shared";
import { Box, Flex, Text } from "~/shared/ui";
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
};

type ActivityGroupProps = {
  data: ActivityGroupDTO;
  withControlButtons?: boolean;
  onStart?: (activityId: ActivityDTO["id"]) => void;
  onPause?: (activityId: ActivityDTO["id"]) => void;
  onFinish?: (activityId: ActivityDTO["id"]) => void;
};

export function ActivityGroup({
  data,
  onStart,
  onPause,
  onFinish,
  withControlButtons = false,
}: ActivityGroupProps) {
  const displayedActiveTotalTime = convertTimeObjectToTimeString(
    convertSecondsToTimeObject(data.totalActiveTime),
  );

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
          return (
            <ActivityListView.Item key={activity.id}>
              <ActivityCard
                activity={activity}
                withControlButtons={withControlButtons}
                onStart={() => onStart?.(activity.id)}
                onPause={() => onPause?.(activity.id)}
                onFinish={() => onFinish?.(activity.id)}
              />
            </ActivityListView.Item>
          );
        })}
      </ActivityListView>
    </Box>
  );
}

ActivityGroup.Skeleton = Skeleton;
