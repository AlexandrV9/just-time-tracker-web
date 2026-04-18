import type { ActivityDTO } from "@to-do-list/shared";
import { Box, Flex, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  formatGroupLabel,
  type CalendarDay,
} from "~/shared/libs";
import { useGroupAnalytics } from "./useGroupAnalytics";
import { ActivityListView } from "~/entities/Activity";
import { ActivityCard } from "~/features";
import { useTranslation } from "~/shared/hooks";

type ActivityGroupListItemProps = {
  calendarDay: CalendarDay;
  activities: ActivityDTO[];
  withControlButtons?: boolean;
  onStart: (activityId: ActivityDTO["id"]) => void;
  onPause: (activityId: ActivityDTO["id"]) => void;
  onFinish: (activityId: ActivityDTO["id"]) => void;
};

export function ActivityGroupListItem({
  calendarDay,
  activities,
  onStart,
  onPause,
  onFinish,
  withControlButtons = false,
}: ActivityGroupListItemProps) {
  const { i18n } = useTranslation();

  const { totalSeconds, analyticsMap, isFetched } = useGroupAnalytics(
    calendarDay,
    activities,
  );

  const visibleActivities = isFetched
    ? activities.filter((a) => (analyticsMap[a.id]?.currentActiveMs ?? 0) > 0)
    : activities;

  console.log("visibleActivities", visibleActivities);

  if (isFetched && visibleActivities.length === 0) {
    return null;
  }

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
            locale: i18n.language,
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
        {visibleActivities.map((activity) => (
          <ActivityListView.Item key={activity.id}>
            <ActivityCard
              activity={activity}
              calendarDay={calendarDay}
              withControlButtons={withControlButtons}
              preloadedAnalytics={analyticsMap[activity.id]}
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
