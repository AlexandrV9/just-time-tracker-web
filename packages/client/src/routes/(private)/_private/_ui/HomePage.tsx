import { Box } from "~/shared/ui";
import {
  CompletedTasksChart,
  PriorityTasks,
  TodayOverview,
} from "~/widgets";

export function HomePage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="0.8rem"
    >
      <TodayOverview />
      <PriorityTasks />
      <CompletedTasksChart />
    </Box>
  );
}
