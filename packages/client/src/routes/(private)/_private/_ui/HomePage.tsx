import { Box, Flex } from "~/shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { activityApiService } from "~/shared/api/services";
import { Stopwatch, type StopwatchSelectedTemplate } from "./Stopwatch";
import { ActivityList } from "./ActivityList";
import { useStopwatch } from "./Stopwatch/useStopwatch";
import type { ActivityDTO } from "@to-do-list/shared";

const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export function HomePage() {
  const queryClient = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] =
    useState<StopwatchSelectedTemplate>(null);

  const activeSessionIdRef = useRef<string | null>(null);
  const selectedActivityRef = useRef<StopwatchSelectedTemplate>(null);
  const playFromCardInFlightRef = useRef(false);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    selectedActivityRef.current = selectedActivity;
  }, [selectedActivity]);

  const { mutateAsync: createActivityAsync } = useMutation({
    mutationFn: activityApiService.createActivity,
  });

  const { mutateAsync: updateActivity } = useMutation({
    mutationFn: activityApiService.updateActivity,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const handleStopTimer = useCallback(
    (durationInSeconds: number) => {
      const endDate = new Date();
      const sessionId = activeSessionIdRef.current;

      if (sessionId) {
        void updateActivity({
          id: sessionId,
          endDate: endDate.toISOString(),
        });
        setActiveSessionId(null);
        activeSessionIdRef.current = null;
        setSelectedActivity(null);
        selectedActivityRef.current = null;
        queryClient.invalidateQueries({ queryKey: ["activities"] });
        return;
      }

      if (durationInSeconds === 0) {
        return;
      }

      const startDate = new Date(endDate.getTime() - durationInSeconds * 1000);

      void createActivityAsync({
        title: selectedActivityRef.current?.title ?? "Unnamed Activity",
        description: selectedActivityRef.current?.description ?? undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdById: DEMO_USER_ID,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      });
    },
    [createActivityAsync, updateActivity, queryClient],
  );

  const { seconds, status, start, pause, stop, discard } =
    useStopwatch(handleStopTimer);

  const handleStartActivity = useCallback(
    async (activity: ActivityDTO) => {
      updateActivity({
        id: activity.id,
        endDate: null,
      });

      return;

      try {
        if (activeSessionId) {
          await updateActivity({
            id: activeSessionId,
            endDate: new Date().toISOString(),
          });
          setActiveSessionId(null);
          activeSessionIdRef.current = null;
          setSelectedActivity(null);
          selectedActivityRef.current = null;
          discard();
        }

        const res = await createActivityAsync({
          title: activity.title,
          description: activity.description ?? undefined,
          startDate: new Date().toISOString(),
          createdById: DEMO_USER_ID,
        });

        if (!res.success || !res.data) return;

        const newId = res.data.id;
        const badge: StopwatchSelectedTemplate = {
          title: activity.title,
          description: activity.description,
        };

        setActiveSessionId(newId);
        activeSessionIdRef.current = newId;
        setSelectedActivity(badge);
        selectedActivityRef.current = badge;

        start();

        queryClient.invalidateQueries({ queryKey: ["activities"] });
      } finally {
        playFromCardInFlightRef.current = false;
      }
    },
    [
      activeSessionId,
      createActivityAsync,
      updateActivity,
      discard,
      start,
      queryClient,
    ],
  );

  const handlePauseActivity = useCallback(
    (activity: ActivityDTO) => {
      updateActivity({
        id: activity.id,
        endDate: new Date().toISOString(),
      });
    },
    [updateActivity],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="1rem"
      px={2}
      py={5}
      maxWidth="100vw"
    >
      <Flex justifyContent="center">
        <Stopwatch
          seconds={seconds}
          status={status}
          onStart={start}
          onPause={pause}
          onFinish={stop}
          selectedActivity={selectedActivity}
        />
      </Flex>
      <ActivityList
        activeSessionId={activeSessionId}
        linkedSeconds={seconds}
        onStartActivity={handleStartActivity}
        onPauseActivity={handlePauseActivity}
      />
    </Box>
  );
}
