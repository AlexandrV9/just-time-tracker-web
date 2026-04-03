import type { ActivityDTO } from "@to-do-list/shared";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, Flex, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import {
  ACTIVITY_SESSION_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { ActivityActionButton } from "./ActivityActionButton";
import { computeTrackedSeconds } from "./utils";

export type ActivityCardProps = {
  activity: ActivityDTO;
  linkedActivityId: string | null;
  linkedSeconds: number;
  onStart?: () => void;
  onPause?: () => void;
};

export const ActivityCard = ({
  activity,
  linkedActivityId,
  linkedSeconds,
  onStart,
  onPause,
}: ActivityCardProps) => {
  const navigate = useNavigate();
  const isLinkedToMainStopwatch = linkedActivityId === activity.id;

  const { data: sessionDetail } = useQuery({
    queryKey: [ACTIVITY_SESSION_QUERY_KEY, activity.currentActivitySessionId],
    queryFn: () =>
      activityApiService.getActivitySession({
        id: activity.currentActivitySessionId!,
      }),
    enabled: Boolean(activity.currentActivitySessionId),
    select: (response) => (response.success ? response.data : undefined),
  });

  const openSegment = sessionDetail?.openSegment;

  /** Avoid showing pause while the list is stale: session may already have an open pause segment. */
  const showPauseButton =
    activity.status === "active" && openSegment?.type !== "pause";

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const needsLiveClock =
      !isLinkedToMainStopwatch &&
      openSegment !== undefined &&
      openSegment !== null &&
      openSegment.endedAt == null &&
      openSegment.type === "active";

    if (!needsLiveClock) return;

    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [isLinkedToMainStopwatch, openSegment]);

  const displaySeconds = useMemo(
    () =>
      computeTrackedSeconds({
        isLinkedToMainStopwatch,
        linkedSeconds,
        activeDurationMs: activity.activeDurationMs,
        pauseDurationMs: activity.pauseDurationMs,
        openSegment,
        tick,
      }),
    [
      isLinkedToMainStopwatch,
      linkedSeconds,
      activity.activeDurationMs,
      activity.pauseDurationMs,
      openSegment,
      tick,
    ],
  );

  const displayedTime = useMemo(
    () =>
      convertTimeObjectToTimeString(convertSecondsToTimeObject(displaySeconds)),
    [displaySeconds],
  );

  const handleCardClick = useCallback(() => {
    navigate({
      to: "/activities/$activityId",
      params: { activityId: activity.id },
    });
  }, [navigate, activity.id]);

  return (
    <Card.Root
      flex="1"
      w="100%"
      minH="clamp(7.5rem, 28vw, 10rem)"
      h="100%"
      display="flex"
      flexDirection="column"
      p="1rem"
      borderRadius="2xl"
      gap={1}
      cursor="pointer"
      onClick={handleCardClick}
      _hover={{ bg: "bg.subtle" }}
    >
      <Card.Body p={0} flex="1" display="flex" flexDirection="column" minH={0}>
        <Flex flex="1" minH={0}>
          <Text textStyle="md" fontWeight="bold" lineClamp={2}>
            {activity.title}
          </Text>
        </Flex>
      </Card.Body>
      <Card.Footer
        p={0}
        justifyContent="space-between"
        alignItems="end"
        mt="auto"
      >
        <Text
          color="fg.muted"
          textStyle="md"
          fontWeight="medium"
          fontFamily="Roboto Mono, monospace"
        >
          {displayedTime}
        </Text> 
        <ActivityActionButton
          showPause={showPauseButton}
          onStart={onStart}
          onPause={onPause}
        />
      </Card.Footer>
    </Card.Root>
  );
};
