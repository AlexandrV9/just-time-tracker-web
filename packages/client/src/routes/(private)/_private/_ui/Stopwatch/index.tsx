import { useMemo } from "react";
import {
  Box,
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  Stack,
  Text,
} from "~/shared/ui";
import { useDisplayedSeconds } from "~/features/ActivityCard/useDisplayedSeconds";
import { useCurrentActivity } from "../useCurrentActivity";

export function Stopwatch() {
  const { currentActivity: resolvedActivity } = useCurrentActivity();

  const isLive = resolvedActivity?.status === "active";
  const activeDurationMs = resolvedActivity?.activeDurationMs ?? 0;

  const tickSeconds = useDisplayedSeconds({
    activeDurationMs,
    hasActiveSession: isLive,
  });

  const seconds = useMemo(() => {
    if (!resolvedActivity) return 0;
    if (resolvedActivity.status === "active") {
      return tickSeconds;
    }
    return Math.floor(resolvedActivity.activeDurationMs / 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resolvedActivity?.id,
    resolvedActivity?.status,
    resolvedActivity?.activeDurationMs,
    tickSeconds,
  ]);

  const displayedTime = useMemo(() => {
    return convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));
  }, [seconds]);

  const displayedTitle = resolvedActivity?.title;

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
