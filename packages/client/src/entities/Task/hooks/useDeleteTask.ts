import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskRepository } from "../model/store";
import { taskSyncManager } from "~/shared/services/SyncManager";
import type { DeleteTaskData } from "./types";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: DeleteTaskData): Promise<boolean> => {
      const localTask = await taskRepository.updateTask({
        localId: taskData.localId,
        isDeleting: true,
      });

      if (!localTask) {
        return false;
      }

      taskSyncManager.createOperation({
        type: "DELETE",
        priority: "medium",
        entity: "task",
        data: taskData,
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // syncService.syncAll().catch(console.error);
    },
  });
};
