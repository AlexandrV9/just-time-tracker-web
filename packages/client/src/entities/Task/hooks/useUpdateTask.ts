import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";
import type { UpdateTaskDataDTO } from "@to-do-list/shared";

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: UpdateTaskDataDTO) => {
      return taskApiService.updateTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // syncService.syncAll().catch(console.error);
    },
  });
};
