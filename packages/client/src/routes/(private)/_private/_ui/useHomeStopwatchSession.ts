import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  activityApiService,
  ACTIVITIES_QUERY_KEY,
} from "~/shared/api/services";
import { useStopwatch } from "./Stopwatch/useStopwatch";
import { useAuthStore } from "~/features/auth";

export function useHomeStopwatchSession() {
  const queryClient = useQueryClient();

  const { user } = useAuthStore();
  const userId = user?.id;

  const { mutateAsync: createActivityFromQuickTimer } = useMutation({
    mutationFn: activityApiService.createActivityFromQuickTimer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
    },
  });

  const handleStopTimer = useCallback(
    (_durationInSeconds: number, totalElapsedMs: number) => {
      if (totalElapsedMs <= 0 || !userId) return;

      const endedAt = Date.now();
      const startedAt = endedAt - Math.floor(totalElapsedMs);

      createActivityFromQuickTimer({
        createdById: userId,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
      });
    },
    [createActivityFromQuickTimer, userId],
  );

  const { seconds, status, start, pause, stop } = useStopwatch(handleStopTimer);

  return {
    seconds,
    status,
    start,
    pause,
    stop,
  };
}
