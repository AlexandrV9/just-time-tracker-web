import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StartActivityDTO } from "@to-do-list/shared";
import {
  activityApiService,
  ACTIVITYES_QUERY_KEY,
} from "~/shared/api/services";

export const useStartActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartActivityDTO) =>
      activityApiService.startActivity(data),
    onSuccess: (response) => {
      console.log(response);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITYES_QUERY_KEY] });
    },
  });
};
