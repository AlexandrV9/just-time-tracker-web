import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeleteTaskDataDTO } from "@to-do-list/shared";
import { taskApiService } from "~/shared/api/services/task";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: DeleteTaskDataDTO) => {
      return taskApiService.deleteTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // syncService.syncAll().catch(console.error);
    },
  });
};
