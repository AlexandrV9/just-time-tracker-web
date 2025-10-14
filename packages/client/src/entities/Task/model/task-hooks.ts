import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskRepository } from "./store";
import type { CreateTaskData, UpdateTaskData } from "./store/types";
import type { Task } from "../types";

export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskRepository.getAll(),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: CreateTaskData) => taskRepository.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // Запускаем синхронизацию в фоне
      // syncService.syncAll().catch(console.error);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: UpdateTaskData) => taskRepository.update(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // syncService.syncAll().catch(console.error);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Task["id"]) => taskRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // syncService.syncAll().catch(console.error);
    },
  });
};
