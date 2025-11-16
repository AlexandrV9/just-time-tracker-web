import { useUpdateTask } from "~/entities/Task";
import { BaseUpdateTaskDialog } from "~/features/tasks/components";
import type { Task } from "~/shared/api/services/task";

export type EditTaskDialogProps = {
  task: Task;
};

export const EditTaskDialog = ({ task }: EditTaskDialogProps) => {
  const updateTaskMutation = useUpdateTask();

  const handleSubmit = (data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }) => {
    return updateTaskMutation.mutateAsync({
      localId: task.localId,
      title: data.title,
      description: data.description,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    });
  };

  return (
    <BaseUpdateTaskDialog
      mode="edit"
      onSubmit={handleSubmit}
      title={task.title}
      description={task.description}
      startDate={task.startDate}
    />
  );
};
