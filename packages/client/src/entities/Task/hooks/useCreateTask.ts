import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskRepository } from "../model/store";
import { type Task } from "~/shared/api/services/task";
import { taskSyncManager } from "~/shared/services/SyncManager";
import type { CreateTaskData } from "./types";
import { useAuthStore } from "~/features/auth";

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (taskData: CreateTaskData): Promise<Task | null> => {
      const localTask = await taskRepository.createTask({
        ...taskData,
        createdById: user!.id,
      });

      if (!localTask) {
        return null;
      }

      taskSyncManager.createOperation({
        type: "CREATE",
        priority: "medium",
        entity: "task",
        data: localTask,
      });

      return localTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // Запускаем синхронизацию в фоне
      // syncService.syncAll().catch(console.error);
    },
  });
};
