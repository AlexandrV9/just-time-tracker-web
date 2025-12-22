import { useQuery } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";

export const useGetTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskApiService.getTasks(),
  });
};
