import { IconButton } from "@chakra-ui/react";
import type { MouseEvent, ReactNode } from "react";
import { Flex, PauseIcon, PlayIcon } from "~/shared/ui";

export type ActivityActionButtonProps = {
  /** True while the session has an open active segment (show pause). */
  showPause: boolean;
  onStart?: () => void;
  onPause?: () => void;
};

export function ActivityActionButton({
  showPause,
  onStart,
  onPause,
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

  if (showPause) {
    return (
      <Flex gap={0} alignItems="center">
        {renderIconButton(<PauseIcon size={24} />, onPause)}
      </Flex>
    );
  }

  return renderIconButton(<PlayIcon size={24} />, onStart);
}
