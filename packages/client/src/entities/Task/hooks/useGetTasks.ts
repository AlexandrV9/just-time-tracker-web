import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { taskApiService } from "~/shared/api/services/task";
import { getDayInterval } from "~/shared/utils";

export type UseGetTasksParams = {
  selectedDate?: Date | null;
};

export const useGetTasks = ({ selectedDate }: UseGetTasksParams) => {
  const { fromDate, toDate } = getDayInterval(selectedDate);

  return useQuery({
    queryKey: ["tasks", selectedDate],
    placeholderData: keepPreviousData,
    queryFn: () =>
      taskApiService.getTasks({
        fromDate,
        toDate,
        sortBy: "status",
        sortOrder: "asc",
      }),
  });
};
