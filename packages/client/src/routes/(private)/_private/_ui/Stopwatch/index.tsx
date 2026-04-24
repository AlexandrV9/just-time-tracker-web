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

export function Stopwatch() {
  const { runningActivity } = useRunningActivity();

  const hasActiveSession = runningActivity?.status === "active";
  const activeDurationMs = runningActivity?.activeDurationMs ?? 0;

  const seconds = useDisplayedSeconds({ activeDurationMs, hasActiveSession });

  const timeObject = useMemo(
    (): TimeObject => convertSecondsToTimeObject(seconds),
    [seconds],
  );

  const displayedTime = useMemo(() => {
    return convertTimeObjectToTimeString(timeObject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeObject.hours, timeObject.minutes, timeObject.seconds]);

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
        {runningActivity && (
          <Text textStyle="sm" color="fg.muted" lineClamp={1}>
            {runningActivity.title}
          </Text>
        )}
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
