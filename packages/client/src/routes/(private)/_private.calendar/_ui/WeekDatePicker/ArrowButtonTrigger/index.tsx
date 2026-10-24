import {
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  type ButtonProps,
} from "~/shared/ui";

import glassStyles from "~/shared/styles/glass.module.css";
import clsx from "clsx";

type ArrowDirection = "left" | "right";

export interface ArrowNavButtonProps extends Omit<ButtonProps, "children"> {
  direction: ArrowDirection;
  withGlassEffect?: boolean;
}

const ICON_BY_DIRECTION = {
  left: ChevronLeftIcon,
  right: ChevronRightIcon,
} as const;

export const ArrowNavButton = ({
  direction,
  className,
  withGlassEffect = false,
  ...props
}: ArrowNavButtonProps) => {
  const Icon = ICON_BY_DIRECTION[direction];

  return (
    <Button
      size="xs"
      aspectRatio="1/1"
      variant="plain"
      display="grid"
      placeItems="center"
      borderRadius="full"
      color="fg"
      bg="bg.muted"
      p={0}
      _hover={{ opacity: 0.92 }}
      className={clsx(withGlassEffect && glassStyles.glass, className)}
      {...props}
    >
      <Icon />
    </Button>
  );
};
