import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
  StartActivityDataDTO,
} from "@time-tracker/shared";

import {
  activityApiService,
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  ACTIVITIES_QUERY_KEY,
  ACTIVITIES_CURRENT_QUERY_KEY,
} from "~/shared/api/services";
import { getOrCreateClientId } from "~/shared/libs";
import { useCurrentActivityStore } from "../useCurrentActivity/useCurrentActivityStore";

export const useStartActivity = () => {
  const queryClient = useQueryClient();
  const updateData = useCurrentActivityStore((state) => state.updateData);

  return useMutation({
    mutationFn: async (
      data: StartActivityDataDTO & { activeDurationMs?: number },
    ) => {
      const response = await activityApiService.startActivity({
        activityId: data.activityId,
        startedAt: data.startedAt,
        clientId: getOrCreateClientId(),
      });

      if (!response.success) {
        throw new Error(response.message ?? "Failed to start activity");
      }

      return response.data;
    },
    onMutate: async ({ activityId, activeDurationMs, startedAt }) => {
      const sessionId = crypto.randomUUID();
      const segmentId = crypto.randomUUID();

      updateData((prev) => {
        const prevSession = prev.currentSession;

        return {
          currentActivity: {
            ...prev.currentActivity,
            id: activityId,
            status: "active",
            currentSessionId: sessionId,
            activeDurationMs:
              activeDurationMs ?? prev.currentActivity?.activeDurationMs ?? 0,
          } as ActivityDTO,
          currentSession: {
            ...prevSession,
            activeDurationMs: prevSession?.activeDurationMs ?? 0,
            pauseDurationMs: prevSession?.pauseDurationMs ?? 0,
            createdAt: prevSession?.createdAt ?? startedAt,
            id: sessionId,
            activityId: activityId,
            endedAt: null,
            status: "active",
            currentSegmentId: segmentId,
            startedAt,
            updatedAt: startedAt,
          } as ActivitySessionDTO,
          currentSegment: {
            id: segmentId,
            sessionId: sessionId,
            type: "active",
            createdAt: startedAt,
            updatedAt: startedAt,
            startedAt,
            endedAt: null,
          } as ActivitySessionSegmentDTO,
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
        currentSession: response.session,
        currentSegment: response.segment ?? prev.currentSegment,
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
        queryKey: [ACTIVITIES_ANALYTICS_QUERY_KEY],
      });
    },
  });
};
