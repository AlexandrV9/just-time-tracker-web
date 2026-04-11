import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ActivityDTO } from "@to-do-list/shared";
import {
  activityApiService,
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  ACTIVITIES_QUERY_KEY,
} from "~/shared/api/services";

export const useFinishActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: ActivityDTO["id"]) =>
      activityApiService.finishActivity({ activityId }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_SESSIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_ANALYTICS_QUERY_KEY],
      });
    },
  });
};
