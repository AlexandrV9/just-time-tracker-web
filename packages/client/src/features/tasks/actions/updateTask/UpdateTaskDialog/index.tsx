import { useUpdateTask, type Task } from "~/entities/Task";
import { BaseUpdateTaskDialog } from "~/features/tasks/components";

export type EditTaskDialogProps = {
  task: Task;
};

export const EditTaskDialog = ({ task }: EditTaskDialogProps) => {
  const createTaskMutation = useUpdateTask();

  const handleSubmit = (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => {
    return createTaskMutation.mutateAsync({
      id: task.id,
      ...data,
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
