import type { ActivityDTO } from "@to-do-list/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { IconButton } from "@chakra-ui/react";
import { Card, Flex, PauseIcon, PlayIcon, Text } from "~/shared/ui";
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

/** Total wall time tracked across all sessions (active + pause intervals). */
const getTotalTrackedSeconds = (a: ActivityDTO): number =>
  Math.floor((a.activeDurationMs + a.pauseDurationMs) / 1000);

export const ActivityCard = ({
  activity,
  activeSessionId,
  linkedSeconds,
  onStart,
  onPause,
}: ActivityCardProps) => {
  const navigate = useNavigate();
  const isLinkedToMain = activeSessionId === activity.id;

  const [displaySeconds, setDisplaySeconds] = useState(() =>
    getTotalTrackedSeconds(activity),
  );

  useEffect(() => {
    if (isLinkedToMain) {
      return;
    }
    setDisplaySeconds(getTotalTrackedSeconds(activity));
  }, [
    isLinkedToMain,
    activity.id,
    activity.activeDurationMs,
    activity.pauseDurationMs,
    activity,
  ]);

  const displayedTime = useMemo(() => {
    const seconds = isLinkedToMain ? linkedSeconds : displaySeconds;
    return convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));
  }, [isLinkedToMain, linkedSeconds, displaySeconds]);

  const handleCardClick = useCallback(() => {
    navigate({
      to: "/activities/$activityId",
      params: { activityId: activity.id },
    });
  }, [navigate, activity.id]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLinkedToMain) {
        onPause(activity);
      } else {
        onStart(activity);
      }
    },
    [isLinkedToMain, activity, onStart, onPause],
  );

  const showPause = isLinkedToMain;

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
        <IconButton variant="ghost" size="sm" onClick={handleToggle}>
          {showPause ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
        </IconButton>
      </Card.Footer>
    </Card.Root>
  );
};
