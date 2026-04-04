import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ActivityDTO } from "@to-do-list/shared";
import {
  activityApiService,
  ACTIVITYES_QUERY_KEY,
  ACTIVITY_SESSION_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
} from "~/shared/api/services";

export const useFinishActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: ActivityDTO["id"]) =>
      activityApiService.finishActivity({ activityId }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITYES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_SESSION_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_SESSIONS_QUERY_KEY],
      });
    },
  });
};
