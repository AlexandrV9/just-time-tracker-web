import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";
import type { CreateTaskDataDTO } from "@to-do-list/shared";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskDataDTO) => {
      return taskApiService.createTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
