import { TaskList } from "~/entities/Task";
import { Box } from "~/shared/ui";

export function TasksPage() {
  return (
    <Box
      display="flex"
      justifyContent="stretch"
      alignItems="center"
      flexGrow={1}
    >
      <TaskList />
    </Box>
  );
}
