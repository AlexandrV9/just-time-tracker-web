import type { ActivityDTO, ActivitySessionStatusDTO } from "@to-do-list/shared";
import type { MouseEvent } from "react";
import { Flex, PauseIcon, PlayIcon, StopIcon } from "~/shared/ui";
import { IconButton } from "@chakra-ui/react";

type ActivityCardControlsProps = {
  activity: ActivityDTO;
  sessionStatus?: ActivitySessionStatusDTO;
  onStart?: (activityId: ActivityDTO["id"]) => void;
  onPause?: (activityId: ActivityDTO["id"]) => void;
  onFinish?: (activityId: ActivityDTO["id"]) => void;
};

export function ActivityCardControls({
  activity,
  sessionStatus,
  onStart,
  onPause,
  onFinish,
}: ActivityCardControlsProps) {
  if (sessionStatus === "active") {
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

  if (sessionStatus === "paused") {
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
    sessionStatus === "finished" ||
    activity.currentSessionId === null
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
}
