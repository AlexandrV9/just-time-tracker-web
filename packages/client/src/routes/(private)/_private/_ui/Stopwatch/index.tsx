import { Box, formatSecondsAsTimeString, Stack, Text } from "~/shared/ui";
import { useDisplayedSeconds } from "~/features/ActivityCard/useDisplayedSeconds";
import { useCurrentActivity } from "~/features";
import { useTranslation } from "~/shared/hooks";

export function Stopwatch() {
  const { t } = useTranslation();
  const { currentActivity, currentSegment } = useCurrentActivity();

  const tickSeconds = useDisplayedSeconds({
    activityId: currentActivity?.id ?? null,
    activeDurationMs: currentActivity?.activeDurationMs ?? 0,
    hasActiveSession: currentActivity?.status === "active",
    startedAt: currentSegment?.startedAt,
  });

  const seconds = currentActivity ? tickSeconds : 0;
  const displayedTitle = currentActivity?.title;
  const displayedTime = formatSecondsAsTimeString(seconds);

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
          {displayedTitle ?? t("pages.home.selectActivity")}
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
