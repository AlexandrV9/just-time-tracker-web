import type { ActivityDTO } from "@to-do-list/shared";
import { Box, Flex, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  formatGroupLabel,
  type CalendarDay,
} from "~/shared/libs";
import { useGroupDayActiveTotalSeconds } from "./useGroupDayActiveTotalSeconds";
import { ActivityListView } from "~/entities/Activity";
import { ActivityCard } from "~/features";

type ActivityGroupListItemProps = {
  calendarDay: CalendarDay;
  activities: ActivityDTO[];
  todayKey: string;
  locale: string;
  onStart: (activityId: ActivityDTO["id"]) => void;
  onPause: (activityId: ActivityDTO["id"]) => void;
  onFinish: (activityId: ActivityDTO["id"]) => void;
};

export function ActivityGroupListItem({
  calendarDay,
  activities,
  locale,
  onStart,
  onPause,
  onFinish,
}: ActivityGroupListItemProps) {
  const totalSeconds = useGroupDayActiveTotalSeconds(calendarDay, activities);

  const totalTime = convertTimeObjectToTimeString(
    convertSecondsToTimeObject(totalSeconds),
  );

  return (
    <Box display="flex" flexDirection="column" gap="0.75rem">
      <Flex justifyContent="space-between" alignItems="center" px={1}>
        <Text textStyle="sm" fontWeight="bold" color="fg.muted">
          {formatGroupLabel({
            key: calendarDay,
            groupBy: "day",
            locale,
          })}
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
            {totalTime}
          </Text>
        </Flex>
      </Flex>
      <ActivityListView>
        {activities.map((activity) => (
          <ActivityListView.Item key={activity.id}>
            <ActivityCard
              activity={activity}
              calendarDay={calendarDay}
              withControlButtons={false}
              onStart={() => onStart(activity.id)}
              onPause={() => onPause(activity.id)}
              onFinish={() => onFinish(activity.id)}
            />
          </ActivityListView.Item>
        ))}
      </ActivityListView>
    </Box>
  );
}
