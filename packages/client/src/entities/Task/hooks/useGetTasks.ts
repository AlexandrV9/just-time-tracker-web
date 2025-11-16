import { useQuery } from "@tanstack/react-query";
import { taskRepository } from "../model/store";
import { taskApiService } from "~/shared/api/services/task";

export const useGetTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      taskApiService.getTasks();
      return taskRepository.getAllTasks();
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};
