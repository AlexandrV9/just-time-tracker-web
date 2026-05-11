import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
  FinishActivityDataDTO,
} from "@to-do-list/shared";
import {
  activityApiService,
  ACTIVITIES_CURRENT_QUERY_KEY,
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  ACTIVITIES_QUERY_KEY,
} from "~/shared/api/services";
import { useCurrentActivityStore } from "~/features/hooks/useCurrentActivityStore";

export const useFinishActivity = () => {
  const queryClient = useQueryClient();
  const { updateData } = useCurrentActivityStore();

  return useMutation({
    mutationFn: async (data: FinishActivityDataDTO) => {
      const response = await activityApiService.finishActivity({
        activityId: data.activityId,
        finishedAt: data.finishedAt,
      });

      if (!response.success) {
        throw new Error(response.message ?? "Failed to finish activity");
      }

      return response.data;
    },
    onMutate: (data: FinishActivityDataDTO) => {
      updateData((prev) => {
        const prevActivity = prev.currentActivity;
        const prevSegment = prev.currentSegment;

        const segmentElapsedMs = prevSegment?.startedAt
          ? Math.max(
              0,
              Date.parse(data.finishedAt) - Date.parse(prevSegment.startedAt),
            )
          : 0;

        const activeDurationMs =
          (prevActivity?.activeDurationMs ?? 0) + segmentElapsedMs;

        return {
          currentActivity: prevActivity
            ? {
                ...prevActivity,
                status: "paused",
                activeDurationMs,
              }
            : null,
          currentSession: null,
          currentSegment: null,
        };
      });
    },
    onSuccess: (response: {
      activity: ActivityDTO;
      session: ActivitySessionDTO;
      segment: ActivitySessionSegmentDTO | null;
    }) => {
      updateData((prev) => ({
        currentActivity: {
          ...response.activity,
          activeDurationMs: prev.currentActivity?.activeDurationMs ?? 0,
          pauseDurationMs: prev.currentActivity?.pauseDurationMs ?? 0,
        },
        currentSession: null,
        currentSegment: null,
      }));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITIES_CURRENT_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_SESSIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_ANALYTICS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITIES_ANALYTICS_QUERY_KEY],
      });
    },
  });
};
