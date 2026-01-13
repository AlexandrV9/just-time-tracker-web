import { Box, Flex } from "~/shared/ui";
import { CircularProgress } from "./CircularProgress";
import { TrackingHistory } from "./TrackingHistory";

export function HomePage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap={5}
    >
      <Flex justifyContent="center">
        <CircularProgress />
      </Flex>
      <TrackingHistory />
      {/* <TodayOverview /> */}
      {/* <PriorityTasks /> */}
      {/* <CompletedTasksChart /> */}
    </Box>
  );
}
