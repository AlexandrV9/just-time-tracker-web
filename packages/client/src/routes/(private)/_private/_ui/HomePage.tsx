import { Box, Flex, Tabs } from "~/shared/ui";
import { Stopwatch } from "./Stopwatch";
import { ActivityList } from "./ActivityList";
import { useHomeStopwatchSession } from "./useHomeStopwatchSession";

export function HomePage() {
  const { seconds, status, start, pause, stop } = useHomeStopwatchSession();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="1rem"
      p={2}
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
      <ActivityList />
    </Box>
  );
}
