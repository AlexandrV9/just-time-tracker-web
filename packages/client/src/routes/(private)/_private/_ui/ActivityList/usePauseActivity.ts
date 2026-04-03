import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PauseActivityDTO } from "@to-do-list/shared";
import {
  activityApiService,
  ACTIVITYES_QUERY_KEY,
  ACTIVITY_SESSION_QUERY_KEY,
} from "~/shared/api/services";

export const usePauseActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PauseActivityDTO) =>
      activityApiService.pauseActivity(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITYES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_SESSION_QUERY_KEY],
      });
    },
  });
};
