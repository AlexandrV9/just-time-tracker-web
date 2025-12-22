import { useCallback } from "react";
import { TaskCard, useDeleteTask } from "~/entities/Task";
import { IconButton, List, Stack, Text, TrashIcon } from "~/shared/ui";
import { EditTaskDialog } from "../actions/updateTask";
import { useGetTasks } from "~/entities/Task/hooks/useGetTasks";
import type { Task } from "~/shared/api/services/task";

export const TaskList = () => {
  const { data: response } = useGetTasks();

  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = useCallback(
    (task: Task) => {
      deleteTaskMutation.mutate({
        id: task.id,
        localId: task.localId,
      });
    },
    [deleteTaskMutation]
  );

  if (!response || !response?.success) {
    return (
      <Stack.VStack flex={1} alignItems="center" justifyContent="center">
        <Text>Список задач пуст</Text>
      </Stack.VStack>
    );
  }

  return (
    <List.Root display="flex" flexDirection="column" w="full" gap="1rem">
      {response.data.data.map((task) => (
        <li key={task.localId}>
          <TaskCard
            task={task}
            actionSlot={
              <Stack.HStack ml="auto">
                <EditTaskDialog task={task} />
                <IconButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTask(task)}
                >
                  <TrashIcon size={20} />
                </IconButton>
              </Stack.HStack>
            }
          />
        </li>
      ))}
    </List.Root>
  );
};
