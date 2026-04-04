import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  activityApiService,
  ACTIVITYES_QUERY_KEY,
} from "~/shared/api/services";
import type { StopwatchSelectedTemplate } from "./Stopwatch";
import { useStopwatch } from "./Stopwatch/useStopwatch";

const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export function useHomeStopwatchSession() {
  const queryClient = useQueryClient();

  const [linkedActivityId, setLinkedActivityId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] =
    useState<StopwatchSelectedTemplate>(null);

  const linkedActivityIdRef = useRef<string | null>(null);
  const selectedActivityRef = useRef<StopwatchSelectedTemplate>(null);

  useEffect(() => {
    linkedActivityIdRef.current = linkedActivityId;
  }, [linkedActivityId]);

  useEffect(() => {
    selectedActivityRef.current = selectedActivity;
  }, [selectedActivity]);

  const { mutateAsync: createActivityAsync } = useMutation({
    mutationFn: activityApiService.createActivity,
  });

  const handleStopTimer = useCallback(
    (durationInSeconds: number) => {
      if (linkedActivityIdRef.current !== null) {
        setLinkedActivityId(null);
        linkedActivityIdRef.current = null;
        setSelectedActivity(null);
        selectedActivityRef.current = null;
        queryClient.invalidateQueries({ queryKey: [ACTIVITYES_QUERY_KEY] });
        return;
      }

      if (durationInSeconds === 0) return;

      void createActivityAsync({
        title: selectedActivityRef.current?.title ?? "Unnamed Activity",
        description: selectedActivityRef.current?.description ?? undefined,
        createdById: DEMO_USER_ID,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: [ACTIVITYES_QUERY_KEY] });
      });
    },
    [createActivityAsync, queryClient],
  );

  const { seconds, status, start, pause, stop } =
    useStopwatch(handleStopTimer);

  return {
    seconds,
    status,
    start,
    pause,
    stop,
    linkedActivityId,
    selectedActivity,
  };
}
