import { TaskList } from "~/entities/Task";
import { CreateTaskDialog } from "~/features/tasks";
import { Box, Input, Stack } from "~/shared/ui";

export function TasksPage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      alignItems="center"
      flexGrow={1}
      gap="1rem"
    >
      <Stack.HStack
        alignItems="center"
        justifyContent="space-between"
        width="full"
      >
        <Input
          color="fg"
          truncate
          placeholder="Enter name your task"
          variant="subtle"
          width="70%"
        />
        <CreateTaskDialog />
      </Stack.HStack>
      <TaskList />
    </Box>
  );
}
