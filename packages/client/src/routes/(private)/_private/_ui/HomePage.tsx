import { Box, Flex } from "~/shared/ui";
import { Stopwatch } from "./Stopwatch";
import { useHomeStopwatchSession } from "./useHomeStopwatchSession";
import { TodayActivities } from "~/widgets";

export function HomePage() {
  const { seconds, status, start, pause, stop } = useHomeStopwatchSession();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="0.5rem"
      maxWidth="100vw"
    >
      <Flex justifyContent="center">
        <Stopwatch
          seconds={seconds}
          status={status}
          onStart={start}
          onPause={pause}
          onFinish={stop}
        />
      </Flex>
      <TodayActivities />
    </Box>
  );
}
