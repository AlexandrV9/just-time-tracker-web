import { CreateTaskDialog, SearchTasks } from "~/features/tasks";
import { TaskList } from "~/features/tasks/TaskList";
import { Box, Stack } from "~/shared/ui";

export function TasksPage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      // alignItems="center"
      flexGrow={1}
      gap="1rem"
    >
      <Stack.HStack
        alignItems="center"
        justifyContent="space-between"
        width="full"
      >
        <SearchTasks />
        <CreateTaskDialog />
      </Stack.HStack>
      <TaskList />
    </Box>
  );
}
