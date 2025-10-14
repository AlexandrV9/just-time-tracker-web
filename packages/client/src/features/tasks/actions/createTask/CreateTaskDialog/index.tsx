import { useCreateTask } from "~/entities/Task";
import { BaseUpdateTaskDialog } from "~/features/tasks/components";

export const CreateTaskDialog = () => {
  const createTaskMutation = useCreateTask();

  const handleSubmit = (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => {
    return createTaskMutation.mutateAsync(data);
  };

  return <BaseUpdateTaskDialog onSubmit={handleSubmit} />;
};
