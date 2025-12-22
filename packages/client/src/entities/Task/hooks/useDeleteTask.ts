import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeleteTaskData } from "./types";
import { taskApiService } from "~/shared/api/services/task";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: DeleteTaskData) => {
      return taskApiService.deleteTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // syncService.syncAll().catch(console.error);
    },
  });
};
