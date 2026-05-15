import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { useCurrentActivityStore } from "~/features/hooks/useCurrentActivityStore";
import {
  activityApiService,
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  ACTIVITIES_QUERY_KEY,
  ACTIVITIES_CURRENT_QUERY_KEY,
} from "~/shared/api/services";

type PauseActivityData = {
  activity: ActivityDTO;
  session: ActivitySessionDTO | null;
  segment: ActivitySessionSegmentDTO | null;
  pausedAt: string;
};

export const usePauseActivity = () => {
  const queryClient = useQueryClient();
  const { updateData } = useCurrentActivityStore();

  return useMutation({
    mutationFn: async (data: PauseActivityData) => {
      const response = await activityApiService.pauseActivity({
        activityId: data.activity.id,
        pausedAt: data.pausedAt,
      });

      if (!response.success) {
        throw new Error(response.message ?? "Failed to pause activity");
      }

      return response.data;
    },
    onMutate: (data: PauseActivityData) => {
      const segmentElapsedMs =
        data.segment?.type === "active" && data.segment.startedAt
          ? Math.max(
              0,
              Date.parse(data.pausedAt) - Date.parse(data.segment.startedAt),
            )
          : 0;

      const activityActiveDurationMs =
        data.activity.activeDurationMs + segmentElapsedMs;

      const sessionActiveDurationMs =
        (data.session?.activeDurationMs ?? 0) + segmentElapsedMs;

      updateData((prev) => {
        if (prev.currentActivity?.id !== data.activity.id) {
          return prev;
        }

        return {
          currentActivity: {
            ...data.activity,
            status: "paused",
            activeDurationMs: activityActiveDurationMs,
          },
          currentSession: data.session
            ? {
                ...data.session,
                status: "paused",
                currentSegmentId: null,
                activeDurationMs: sessionActiveDurationMs,
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
