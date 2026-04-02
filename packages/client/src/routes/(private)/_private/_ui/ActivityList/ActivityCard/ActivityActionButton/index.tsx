import { IconButton } from "@chakra-ui/react";
import type { ActivityDTO } from "@to-do-list/shared";
import type { MouseEvent, ReactNode } from "react";
import { PlayIcon, PauseIcon } from "~/shared/ui";

export type ActivityActionButtonProps = {
  status: ActivityDTO["status"];
  onStart?: () => void;
  onPause: () => void;
  onStop?: () => void;
};

export function ActivityActionButton({
  status,
  onStart,
  onPause,
  onStop,
}: ActivityActionButtonProps) {
  const renderIconButton = (icon: ReactNode, onClick?: () => void) => (
    <IconButton
      variant="ghost"
      size="sm"
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {icon}
    </IconButton>
  );

  switch (status) {
    case "idle":
    case "finished":
      return renderIconButton(<PlayIcon size={24} />, onStart);
    case "active":
      return renderIconButton(<PauseIcon size={24} />, onPause);
    case "paused":
      return renderIconButton(<PlayIcon size={24} />, onStop);
    default:
      return null;
  }
}
