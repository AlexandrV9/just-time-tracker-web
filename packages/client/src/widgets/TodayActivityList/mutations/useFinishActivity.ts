import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
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

type FinishActivityData = {
  activity: ActivityDTO;
  session: ActivitySessionDTO | null;
  segment: ActivitySessionSegmentDTO | null;
  finishedAt: string;
};

export const useFinishActivity = () => {
  const queryClient = useQueryClient();
  const { updateData } = useCurrentActivityStore();

  return useMutation({
    mutationFn: async (data: FinishActivityData) => {
      const response = await activityApiService.finishActivity({
        activityId: data.activity.id,
        finishedAt: data.finishedAt,
      });

      if (!response.success) {
        throw new Error(response.message ?? "Failed to finish activity");
      }

      return response.data;
    },
    onMutate: (data: FinishActivityData) => {
      const segmentElapsedMs =
        data.segment?.type === "active" && data.segment.startedAt
          ? Math.max(
              0,
              Date.parse(data.finishedAt) - Date.parse(data.segment.startedAt),
            )
          : 0;

      const activityActiveDurationMs =
        data.activity.activeDurationMs + segmentElapsedMs;

      updateData((prev) => {
        if (prev.currentActivity?.id !== data.activity.id) {
          return prev;
        }

        return {
          currentActivity: {
            ...data.activity,
            status: "idle",
            currentSessionId: null,
            activeDurationMs: activityActiveDurationMs,
          },
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
