import { useMemo } from "react";
import {
  Box,
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  Stack,
  Text,
} from "~/shared/ui";
import { useDisplayedSeconds } from "~/features/ActivityCard/useDisplayedSeconds";
import { useSelectedActivity } from "~/features";

export function Stopwatch() {
  const { activity: selectedActivity } = useSelectedActivity();

  console.log("selectedActivity", selectedActivity)

  const tickSeconds = useDisplayedSeconds({
    activeDurationMs: selectedActivity?.activeDurationMs ?? 0,
    hasActiveSession: selectedActivity?.status === "active",
  });

  const seconds = useMemo(() => {
    if (!selectedActivity) {
      return 0;
    }

    if (selectedActivity.status === "active") {
      return tickSeconds;
    }
    return Math.floor(selectedActivity.activeDurationMs / 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedActivity?.id,
    selectedActivity?.status,
    selectedActivity?.activeDurationMs,
    tickSeconds,
  ]);

  const displayedTime = useMemo(() => {
    return convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));
  }, [seconds]);

  const displayedTitle = selectedActivity?.title;

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
