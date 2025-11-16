import { useCallback } from "react";
import { TaskCard, useDeleteTask } from "~/entities/Task";
import {
  // EditIcon,
  IconButton,
  List,
  Stack,
  Text,
  TrashIcon,
} from "~/shared/ui";
import { EditTaskDialog } from "../actions/updateTask";
import { useTaskEvents } from "~/entities/Task/hooks/useTaskEvents";
import { useGetTasks } from "~/entities/Task/hooks/useGetTasks";
import type { Task } from "~/shared/api/services/task";
import { useQueryClient } from "@tanstack/react-query";

export const TaskList = () => {
  const queryClient = useQueryClient();
  const { data: tasks } = useGetTasks();

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

  useTaskEvents({
    onTaskCreated: () => {
      console.log("onTaskCreated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onTaskUpdated: () => {
      console.log("onTaskUpdated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onTaskDeleted: () => {
      console.log("onTaskDeleted");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onSyncSuccess: () => {
      console.log("onSyncSuccesss");
    },
    onSyncError: () => {
      console.log("onSyncError");
    },
  });

  console.log("tasks ===> ", tasks);

  if (!tasks) {
    return (
      <Stack.VStack flex={1} alignItems="center" justifyContent="center">
        <Text>Список задач пуст</Text>
      </Stack.VStack>
    );
  }

  return (
    <List.Root display="flex" flexDirection="column" w="full" gap="1rem">
      {tasks.map((task) => (
        <li key={task.localId}>
          <TaskCard
            task={task}
            actionSlot={
              <Stack.HStack ml="auto">
                {/* <IconButton variant="outline" size="sm">
                  <EditIcon size={20} />
                </IconButton> */}
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
