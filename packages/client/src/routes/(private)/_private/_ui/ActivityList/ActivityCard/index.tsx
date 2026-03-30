import type { ActivityDTO } from "@to-do-list/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { IconButton } from "@chakra-ui/react";
import {
  Card,
  Flex,
  PauseIcon,
  PlayIcon,
  Text,
} from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

type ActivityCardProps = {
  activity: ActivityDTO;
  activeSessionId: string | null;
  linkedSeconds: number;
  onStart: (activity: ActivityDTO) => void;
  onPause: (activity: ActivityDTO) => void;
};

const getDurationSeconds = (
  startDate: string,
  endDate: string | null | undefined,
): number => {
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 1000));
};

export const ActivityCard = ({
  activity,
  activeSessionId,
  linkedSeconds,
  onStart,
  onPause,
}: ActivityCardProps) => {
  const navigate = useNavigate();
  const isLinkedToMain = activeSessionId === activity.id;
  const isTrackingOnServer = !activity.endDate;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [liveSeconds, setLiveSeconds] = useState(() =>
    getDurationSeconds(activity.startDate, activity.endDate),
  );

  useEffect(() => {
    if (isLinkedToMain) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (isTrackingOnServer) {
      setLiveSeconds(getDurationSeconds(activity.startDate, null));
      intervalRef.current = setInterval(() => {
        setLiveSeconds(getDurationSeconds(activity.startDate, null));
      }, 1000);
    } else {
      setLiveSeconds(getDurationSeconds(activity.startDate, activity.endDate));
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    isLinkedToMain,
    isTrackingOnServer,
    activity.startDate,
    activity.endDate,
  ]);

  const displayedTime = useMemo(() => {
    const seconds = isLinkedToMain
      ? linkedSeconds
      : liveSeconds;
    return convertTimeObjectToTimeString(
      convertSecondsToTimeObject(seconds),
    );
  }, [isLinkedToMain, linkedSeconds, liveSeconds]);

  const handleCardClick = useCallback(() => {
    navigate({ to: "/activities/$activityId", params: { activityId: activity.id } });
  }, [navigate, activity.id]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLinkedToMain || isTrackingOnServer) {
        onPause(activity);
      } else {
        onStart(activity);
      }
    },
    [isLinkedToMain, isTrackingOnServer, activity, onStart, onPause],
  );

  const showPause = isLinkedToMain || isTrackingOnServer;

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
      {...(showPause && {
        borderColor: "border.accent",
        borderWidth: "1px",
      })}
    >
      <Card.Body p={0} flex="1" display="flex" flexDirection="column" minH={0}>
        <Flex flex="1" minH={0}>
          <Text textStyle="md" fontWeight="bold" lineClamp={2}>
            {activity.title}
          </Text>
        </Flex>
      </Card.Body>
      <Card.Footer p={0} justifyContent="space-between" alignItems="end" mt="auto">
        <Text
          color="fg.muted"
          textStyle="md"
          fontWeight="medium"
          fontFamily="Roboto Mono, monospace"
        >
          {displayedTime}
        </Text>
        <IconButton variant="ghost" size="sm" onClick={handleToggle}>
          {showPause ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
        </IconButton>
      </Card.Footer>
    </Card.Root>
  );
};
