import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StartActivityDTO } from "@to-do-list/shared";
import {
  activityApiService,
  ACTIVITYES_QUERY_KEY,
  ACTIVITY_SESSION_QUERY_KEY,
} from "~/shared/api/services";

export const useStartActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartActivityDTO) =>
      activityApiService.startActivity(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITYES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_SESSION_QUERY_KEY],
      });
    },
  });
};
