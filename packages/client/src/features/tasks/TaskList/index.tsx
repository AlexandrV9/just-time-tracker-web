import { useCallback } from "react";
import { TaskCard, useDeleteTask, useTasks, type Task } from "~/entities/Task";
import {
  // EditIcon,
  IconButton,
  List,
  Stack,
  Text,
  TrashIcon,
} from "~/shared/ui";
import { EditTaskDialog } from "../actions/updateTask";

export const TaskList = () => {
  const { data: tasks } = useTasks();

  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = useCallback(
    (taskId: Task["id"]) => {
      deleteTaskMutation.mutate(taskId);
    },
    [deleteTaskMutation]
  );

  if (!tasks) {
    return (
      <Stack.VStack flex={1} alignItems="center" justifyContent="center">
        <Text>Список задач пуст </Text>
      </Stack.VStack>
    );
  }

  // const tasks = Array.from(data.values());

  return (
    <List.Root display="flex" flexDirection="column" w="full" gap="1rem">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            data={task}
            actionSlot={
              <Stack.HStack ml="auto">
                {/* <IconButton variant="outline" size="sm">
                  <EditIcon size={20} />
                </IconButton> */}
                <EditTaskDialog task={task} />
                <IconButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
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
