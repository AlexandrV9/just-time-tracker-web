import type { ActivityDTO, ActivitySessionDTO } from "@to-do-list/shared";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, type MouseEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, Flex, PauseIcon, PlayIcon, StopIcon, Text } from "~/shared/ui";

import {
  ACTIVITY_SESSION_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { IconButton } from "@chakra-ui/react";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

/** Local calendar day as half-open [from, to) in ISO UTC, aligned with list date headers. */
const getLocalDayBoundsIso = (dayKey: string) => {
  const dayStart = new Date(`${dayKey}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { fromDate: dayStart.toISOString(), toDate: dayEnd.toISOString() };
};

export const computeTrackedSeconds = (
  sessions: ActivitySessionDTO[],
): number => {
  const ms = sessions.reduce((sum, s) => sum + s.activeDurationMs, 0);
  return Math.floor(ms / 1000);
};

export type ActivityCardProps = {
  activity: ActivityDTO;
  dayKey: string;
  showControlButtons: boolean;
  linkedActivityId: string | null;
  linkedSeconds: number;
  onStart?: (activityId: ActivityDTO["id"]) => void;
  onPause?: (activityId: ActivityDTO["id"]) => void;
  onFinish?: (activityId: ActivityDTO["id"]) => void;
};

export const ActivityCard = ({
  activity,
  dayKey,
  showControlButtons,
  onStart,
  onPause,
  onFinish,
}: ActivityCardProps) => {
  const navigate = useNavigate();

  const { fromDate, toDate } = useMemo(
    () => getLocalDayBoundsIso(dayKey),
    [dayKey],
  );

  const { data } = useQuery({
    queryKey: [ACTIVITY_SESSION_QUERY_KEY, activity.currentActivitySessionId],
    queryFn: () =>
      activityApiService.getActivitySession({
        id: activity.currentActivitySessionId!,
      }),
    enabled: showControlButtons && Boolean(activity.currentActivitySessionId),
    select: (response) => (response.success ? response.data : undefined),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, activity.id, fromDate, toDate],
    queryFn: () =>
      activityApiService.getActivitySessions({
        activityId: activity.id,
        fromDate,
        toDate,
      }),
    select: (response) => (response.success ? response.data.sessions : []),
  });

  const { session } = data ?? {};

  const displayedTime = useMemo(
    () =>
      convertTimeObjectToTimeString(
        convertSecondsToTimeObject(computeTrackedSeconds(sessions)),
      ),
    [sessions],
  );

  const handleCardClick = useCallback(() => {
    navigate({
      to: "/activities/$activityId",
      params: { activityId: activity.id },
    });
  }, [navigate, activity.id]);

  const renderConrolButtons = () => {
    if (!showControlButtons) {
      return null;
    }

    if (session?.status === "active") {
      return (
        <Flex justify="right" alignItems="center" gap="1rem">
          <IconButton
            variant="ghost"
            size="2xs"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onPause?.(activity.id);
            }}
          >
            <PauseIcon />
          </IconButton>
        </Flex>
      );
    }

    if (session?.status === "paused") {
      return (
        <Flex justify="right" alignItems="center" gap="0.5rem">
          <IconButton
            variant="ghost"
            size="2xs"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onFinish?.(activity.id);
            }}
          >
            <StopIcon />
          </IconButton>
          <IconButton
            variant="ghost"
            size="2xs"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onStart?.(activity.id);
            }}
          >
            <PlayIcon />
          </IconButton>
        </Flex>
      );
    }

    if (
      session?.status === "finished" ||
      activity.currentActivitySessionId === null
    ) {
      return (
        <IconButton
          variant="ghost"
          size="2xs"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onStart?.(activity.id);
          }}
        >
          <PlayIcon />
        </IconButton>
      );
    }

    return null;
  };

  return (
    <Card.Root
      flex="1"
      w="100%"
      minH="clamp(7.5rem, 28vw, 10rem)"
      h="100%"
      display="flex"
      flexDirection="column"
      p="0.8rem"
      borderRadius="2xl"
      gap={1}
      cursor="pointer"
      onClick={handleCardClick}
      overflow="hidden"
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
          textStyle="sm"
          fontWeight="medium"
          fontFamily="Roboto Mono, monospace"
        >
          {displayedTime}
        </Text>
        {renderConrolButtons()}
      </Card.Footer>
    </Card.Root>
  );
};
