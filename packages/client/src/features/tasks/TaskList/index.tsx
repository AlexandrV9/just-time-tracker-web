import { useCallback, useState } from "react";
import { TaskCard } from "~/entities/Task";
import { Button, List, Stack, Text } from "~/shared/ui";
import { UpdateTaskDialog } from "../actions/updateTask";
import { useGetTasks } from "~/entities/Task/hooks/useGetTasks";
import type { Task } from "~/shared/api/services/task";
import { useNavigate } from "@tanstack/react-router";
import { TaskMenuButton } from "~/entities/Task/ui/TaskCard/TaskMenuButton";
import { ConfirmDeleteTaskDialog } from "../actions/deleteTask";
import { useDialog } from "@ark-ui/react";

export type TaskListProps = {
  selectedDate?: Date | null;
};

export const TaskList = ({ selectedDate }: TaskListProps) => {
  const navigate = useNavigate();

  const { data: response, isLoading, refetch } = useGetTasks({ selectedDate });

  const updateTaskDialog = useDialog();
  const deleteTaskDialog = useDialog();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenConfirmDeleteTaskDialog = useCallback(
    (task: Task) => () => {
      setSelectedTask(task);
      deleteTaskDialog.setOpen(true);
    },
    [deleteTaskDialog]
  );

  const handleOpenUpdateTaskDialog = useCallback(
    (task: Task | null) => () => {
      setSelectedTask(task);
      updateTaskDialog.setOpen(true);
    },
    [updateTaskDialog]
  );

  const handleViewTask = useCallback(
    (task: Task) => () => {
      navigate({
        to: "/tasks/$taskId",
        params: { taskId: task.id },
      });
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <List.Root display="flex" flexDirection="column" w="full" gap="1rem">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index}>
            <TaskCard.Skeleton />
          </li>
        ))}
      </List.Root>
    );
  }

  if (!response || !response?.success) {
    return (
      <Stack.VStack
        flex={1}
        gap={5}
        alignItems="center"
        justifyContent="center"
      >
        <Text>Возникли ошибки при загрузке задач</Text>
        <Button onClick={() => refetch()}>Попробовать снова</Button>
      </Stack.VStack>
    );
  }

  if (response.data.data.length === 0) {
    return (
      <Stack.VStack
        flex={1}
        gap={5}
        alignItems="center"
        justifyContent="center"
      >
        <Text>Список задач пуст</Text>
      </Stack.VStack>
    );
  }

  return (
    <>
      <List.Root display="flex" flexDirection="column" w="full" gap="1rem">
        {response.data.data.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              actionSlot={
                <TaskMenuButton
                  onView={handleViewTask(task)}
                  onEdit={handleOpenUpdateTaskDialog(task)}
                  onDelete={handleOpenConfirmDeleteTaskDialog(task)}
                />
              }
            />
          </li>
        ))}
      </List.Root>
      <UpdateTaskDialog dialog={updateTaskDialog} task={selectedTask} />
      <ConfirmDeleteTaskDialog dialog={deleteTaskDialog} task={selectedTask} />
    </>
  );
};
