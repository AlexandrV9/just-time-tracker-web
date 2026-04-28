import type { ActivityDTO, ActivityStatusDTO } from "@to-do-list/shared";
import type { MouseEvent } from "react";
import { Flex, PauseIcon, PlayIcon, StopIcon } from "~/shared/ui";
import { IconButton } from "@chakra-ui/react";

type ActivityCardControlsProps = {
  hasActiveSession?: boolean;
  sessionStatus?: ActivityStatusDTO;
  activityId: ActivityDTO["id"];
  onStart?: (activityId: ActivityDTO["id"]) => void;
  onPause?: (activityId: ActivityDTO["id"]) => void;
  onFinish?: (activityId: ActivityDTO["id"]) => void;
};

export function ActivityCardControls({
  activityId,
  hasActiveSession,
  sessionStatus,
  onStart,
  onPause,
  onFinish,
}: ActivityCardControlsProps) {
  if (sessionStatus === "active") {
    return (
      <Flex justify="right" alignItems="center" gap="0.5rem">
        <IconButton
          variant="ghost"
          size="2xs"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onFinish?.(activityId);
          }}
        >
          <StopIcon />
        </IconButton>
        <IconButton
          variant="ghost"
          size="2xs"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onPause?.(activityId);
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
            onFinish?.(activityId);
          }}
        >
          <StopIcon />
        </IconButton>
        <IconButton
          variant="ghost"
          size="2xs"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onStart?.(activityId);
          }}
        >
          <PlayIcon />
        </IconButton>
      </Flex>
    );
  }

  if (sessionStatus === "idle" || !hasActiveSession) {
    return (
      <IconButton
        variant="ghost"
        size="2xs"
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          onStart?.(activityId);
        }}
      >
        <PlayIcon />
      </IconButton>
    );
  }

  return null;
}
