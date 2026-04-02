import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PauseActivityDTO } from "@to-do-list/shared";
import {
  activityApiService,
  ACTIVITYES_QUERY_KEY,
} from "~/shared/api/services";

export const usePauseActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PauseActivityDTO) =>
      activityApiService.pauseActivity(data),
    onSuccess: (response) => {
      console.log(response);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITYES_QUERY_KEY] });
    },
  });
};
