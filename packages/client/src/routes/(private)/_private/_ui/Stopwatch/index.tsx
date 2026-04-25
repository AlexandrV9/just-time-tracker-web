import { useMemo } from "react";
import {
  Box,
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  Stack,
  Text,
  type TimeObject,
} from "~/shared/ui";
import { useDisplayedSeconds } from "~/features/ActivityCard/useDisplayedSeconds";
import { useRunningActivity } from "./useRunningActivity";

type StopwatchProps = {
  selectedActivityId?: string;
};

export function Stopwatch({ selectedActivityId }: StopwatchProps) {
  const { runningActivity, activities } = useRunningActivity();

  const selectedActivity = selectedActivityId
    ? activities.find((a) => a.id === selectedActivityId)
    : undefined;

  const selectedActiveDurationMs = selectedActivity?.activeDurationMs;

  const isLive = runningActivity?.status === "active";
  const activeDurationMs = runningActivity?.activeDurationMs ?? 0;

  const tickSeconds = useDisplayedSeconds({
    activeDurationMs,
    hasActiveSession: isLive,
  });

  const seconds = useMemo(() => {
    if (runningActivity) {
      if (isLive) return tickSeconds;
      return Math.floor(runningActivity.activeDurationMs / 1000);
    }
    if (selectedActiveDurationMs !== undefined) {
      return Math.floor(selectedActiveDurationMs / 1000);
    }
    return 0;
  }, [runningActivity, isLive, tickSeconds, selectedActiveDurationMs]);

  const timeObject = useMemo(
    (): TimeObject => convertSecondsToTimeObject(seconds),
    [seconds],
  );

  const displayedTime = useMemo(() => {
    return convertTimeObjectToTimeString(timeObject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeObject.hours, timeObject.minutes, timeObject.seconds]);

  const displayedTitle = selectedActivity?.title ?? runningActivity?.title;

  return (
    <Stack.VStack
      w="full"
      backdropFilter="blur(20px)"
      p="1rem"
      gap="0.8rem"
      overflow="hidden"
      maxWidth="500px"
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="1rem"
        alignItems="center"
        w="full"
        justifyContent="center"
        position="relative"
      >
        <Text
          textStyle="sm"
          color={displayedTitle ? "fg.muted" : "fg.subtle"}
          lineClamp={1}
        >
          {displayedTitle ?? "Выберите активность"}
        </Text>
        <Text
          style={{
            fontSize: 40,
            fontFamily: "Roboto Mono, monospace",
          }}
        >
          {displayedTime}
        </Text>
      </Box>
    </Stack.VStack>
  );
}
