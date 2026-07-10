import {
  Box,
  Button,
  Flex,
  formatSecondsAsTimeString,
  PauseIcon,
  PlayIcon,
  Stack,
  StopCircleIcon,
  Text,
} from "~/shared/ui";
import { useCurrentActivity } from "~/features";
import { useTranslation } from "~/shared/hooks";

import styles from "./Stopwatch.module.css";

export function Stopwatch() {
  const { t } = useTranslation();

  const {
    currentActivity,
    currentSession,
    status,
    displayedSeconds,
    start,
    pause,
    finish,
  } = useCurrentActivity();

  const displayedTitle = currentActivity?.title;
  const displayedTime = formatSecondsAsTimeString(displayedSeconds);

  const hasActivity = Boolean(currentActivity);
  const isActive = status === "active";
  const canStop = Boolean(currentSession);

  return (
    <Stack.VStack
      w="full"
      backdropFilter="blur(20px)"
      p="1rem"
      gap="0.8rem"
      overflow="hidden"
      maxWidth="500px"
      className={styles.container}
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
        <Flex
          gap="1rem"
          minW="220px"
          w="full"
          justifyContent="center"
          alignItems="center"
        >
          <Button
            variant="subtle"
            borderRadius="0.5rem"
            w="100px"
            disabled={!canStop}
            onClick={() => finish()}
          >
            <StopCircleIcon />
          </Button>
          <Button
            borderRadius="0.5rem"
            w="100px"
            disabled={!hasActivity}
            onClick={() => (isActive ? pause() : start())}
          >
            {isActive ? <PauseIcon /> : <PlayIcon />}
          </Button>
        </Flex>
      </Box>
    </Stack.VStack>
  );
}
