import { useCreateTask } from "~/entities/Task";
import { useAuthStore } from "~/features/auth";
import { BaseUpdateTaskDialog } from "~/features/tasks/components";

export const CreateTaskDialog = () => {
  const createTaskMutation = useCreateTask();
  const user = useAuthStore((state) => state.user);

  const handleSubmit = (data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }) => {
    return createTaskMutation.mutateAsync({
      title: data.title,
      description: data.description,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      status: "todo",
      priority: "low",
      createdById: user!.id,
    });
  };

  return <BaseUpdateTaskDialog onSubmit={handleSubmit} />;
};
