import type { ActivityDTO } from "@to-do-list/shared";
import { Box, Flex, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  type CalendarDay,
} from "~/shared/libs";
import { ActivityListView } from "~/entities/Activity";
import { ActivityCard } from "~/features";
import { Skeleton } from "./Skeleton";

export type ActivityGroupDTO = {
  label: string;
  totalActiveTime: number;
  activities: ActivityDTO[];
};

type ActivityGroupListItemProps = {
  data: ActivityGroupDTO;
  calendarDay?: CalendarDay;
  withControlButtons?: boolean;
  onStart?: (activityId: ActivityDTO["id"]) => void;
  onPause?: (activityId: ActivityDTO["id"]) => void;
  onFinish?: (activityId: ActivityDTO["id"]) => void;
};

export function ActivityGroupListItem({
  data,
  calendarDay,
  onStart,
  onPause,
  onFinish,
  withControlButtons = false,
}: ActivityGroupListItemProps) {
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
        {data.activities.map((activity) => (
          <ActivityListView.Item key={activity.id}>
            <ActivityCard
              activity={activity}
              calendarDay={calendarDay}
              withControlButtons={withControlButtons}
              onStart={() => onStart?.(activity.id)}
              onPause={() => onPause?.(activity.id)}
              onFinish={() => onFinish?.(activity.id)}
            />
          </ActivityListView.Item>
        ))}
      </ActivityListView>
    </Box>
  );
}

ActivityGroupListItem.Skeleton = Skeleton;
