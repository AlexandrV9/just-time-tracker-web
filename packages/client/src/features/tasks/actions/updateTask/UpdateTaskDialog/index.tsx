import dayjs from "dayjs";
import { useCallback } from "react";
import { useUpdateTask } from "~/entities/Task";
import {
  BaseUpdateTaskDialog,
  type BaseUpdateTaskDialogProps,
} from "~/features/tasks/components";

export type UpdateTaskDialogProps = Omit<
  BaseUpdateTaskDialogProps,
  "mode" | "onSubmit"
>;

export const UpdateTaskDialog = ({ task, ...props }: UpdateTaskDialogProps) => {
  const updateTaskMutation = useUpdateTask();

  const handleUpdateTask = useCallback(
    (data: {
      title: string;
      description: string;
      startDate: Date;
      endDate: Date;
    }) => {
      if (!task?.id) return;

      return updateTaskMutation.mutateAsync({
        id: task.id,
        title: data.title,
        description: data.description,
        startDate: dayjs(data.startDate).second(0).millisecond(0).toISOString(),
        endDate: dayjs(data.endDate).second(0).millisecond(0).toISOString(),
      });
    },
    [updateTaskMutation, task?.id]
  );

  return (
    <BaseUpdateTaskDialog
      mode="edit"
      task={task}
      onSubmit={handleUpdateTask}
      {...props}
    />
  );
};
