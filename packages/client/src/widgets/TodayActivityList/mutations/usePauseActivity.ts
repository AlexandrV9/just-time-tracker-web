import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
  PauseActivityDataDTO,
} from "@to-do-list/shared";
import { useCurrentActivityStore } from "~/features/hooks/useCurrentActivityStore";
import {
  activityApiService,
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  ACTIVITIES_QUERY_KEY,
} from "~/shared/api/services";

export const usePauseActivity = () => {
  const queryClient = useQueryClient();
  const { updateData } = useCurrentActivityStore();

  return useMutation({
    mutationFn: async (data: PauseActivityDataDTO) => {
      const response = await activityApiService.pauseActivity({
        activityId: data.activityId,
        pausedAt: data.pausedAt,
      });

      if (!response.success) {
        throw new Error(response.message ?? "Failed to pause activity");
      }

      return response.data;
    },
    onMutate: (data: PauseActivityDataDTO) => {
      updateData((prev) => {
        const prevActivity = prev.currentActivity;
        const prevSession = prev.currentSession;
        const prevSegment = prev.currentSegment;

        // activeDurationMs from the server represents only completed segments.
        // Add the current segment's elapsed time to get the full accumulated value.
        const segmentElapsedMs = prevSegment?.startedAt
          ? Math.max(
              0,
              Date.parse(data.pausedAt) - Date.parse(prevSegment.startedAt),
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
          currentSession: prevSession
            ? {
                ...prevSession,
                status: "paused",
                currentSegmentId: null,
                activeDurationMs,
                updatedAt: data.pausedAt,
              }
            : null,
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
        currentSession: {
          ...response.session,
          activeDurationMs: prev.currentSession?.activeDurationMs ?? 0,
        },
        currentSegment: null,
      }));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
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
