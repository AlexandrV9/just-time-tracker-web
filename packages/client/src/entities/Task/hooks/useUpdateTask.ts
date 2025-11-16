import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskRepository } from "../model/store";
import { taskSyncManager } from "~/shared/services/SyncManager";
import { type Task } from "~/shared/api/services/task";
import type { UpdateTaskData } from "./types";

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: UpdateTaskData): Promise<Task | null> => {
      const localTask = await taskRepository.updateTask({
        ...taskData,
        syncStatus: "pending",
      });

      if (!localTask) {
        return null;
      }

      taskSyncManager.createOperation({
        type: "UPDATE",
        priority: "medium",
        entity: "task",
        data: localTask,
      });

      return localTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // syncService.syncAll().catch(console.error);
    },
  });
};
