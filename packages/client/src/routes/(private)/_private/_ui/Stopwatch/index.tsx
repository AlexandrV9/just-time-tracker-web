import { Box, formatSecondsAsTimeString, Stack, Text } from "~/shared/ui";
import { useCurrentActivity, useDisplayedSessionSeconds } from "~/features";
import { useTranslation } from "~/shared/hooks";

export function Stopwatch() {
  const { t } = useTranslation();

  const { currentActivity, currentSession, currentSegment } =
    useCurrentActivity();

  const seconds = useDisplayedSessionSeconds({
    session: currentSession,
    segment: currentSegment,
  });

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
