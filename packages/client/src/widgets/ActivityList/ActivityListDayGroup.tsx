import type { ActivityDTO } from "@to-do-list/shared";
import { Box, Flex, List, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  formatGroupLabel,
} from "~/shared/libs";
import { ActivityCard } from "./ActivityCard";
import { useGroupDayActiveTotalSeconds } from "./useGroupDayActiveTotalSeconds";

type ActivityListDayGroupProps = {
  dateKey: string;
  activities: ActivityDTO[];
  todayKey: string;
  locale: string;
  onStart: (activityId: ActivityDTO["id"]) => void;
  onPause: (activityId: ActivityDTO["id"]) => void;
  onFinish: (activityId: ActivityDTO["id"]) => void;
};

export function ActivityListDayGroup({
  dateKey,
  activities,
  todayKey,
  locale,
  onStart,
  onPause,
  onFinish,
}: ActivityListDayGroupProps) {
  const totalSeconds = useGroupDayActiveTotalSeconds(dateKey, activities);

  const totalTime = convertTimeObjectToTimeString(
    convertSecondsToTimeObject(totalSeconds),
  );

  return (
    <Box display="flex" flexDirection="column" gap="0.75rem">
      <Flex justifyContent="space-between" alignItems="center" px={1}>
        <Text textStyle="sm" fontWeight="bold" color="fg.muted">
          {formatGroupLabel({
            key: dateKey,
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

      <List.Root
        listStyleType="none"
        w="full"
        gap="0.75rem"
        display="grid"
        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        md={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        xl={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
        alignItems="stretch"
      >
        {activities.map((activity) => (
          <List.Item
            key={activity.id}
            display="flex"
            minH={0}
            alignSelf="stretch"
          >
            <ActivityCard
              activity={activity}
              dayKey={dateKey}
              showControlButtons={dateKey === todayKey}
              onStart={onStart}
              onPause={onPause}
              onFinish={onFinish}
            />
          </List.Item>
        ))}
      </List.Root>
    </Box>
  );
}
