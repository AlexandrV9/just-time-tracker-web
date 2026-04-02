import { Box, Flex } from "~/shared/ui";
import { Stopwatch } from "./Stopwatch";
import { ActivityList } from "./ActivityList";
import { useHomeStopwatchSession } from "./useHomeStopwatchSession";

export function HomePage() {
  const {
    seconds,
    status,
    start,
    pause,
    stop,
    linkedActivityId,
    selectedActivity,
  } = useHomeStopwatchSession();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="1rem"
      px={2}
      py={5}
      maxWidth="100vw"
    >
      <Flex justifyContent="center">
        <Stopwatch
          seconds={seconds}
          status={status}
          onStart={start}
          onPause={pause}
          onFinish={stop}
          selectedActivity={selectedActivity}
        />
      </Flex>
      <ActivityList
        linkedActivityId={linkedActivityId}
        linkedSeconds={seconds}
      />
    </Box>
  );
}
