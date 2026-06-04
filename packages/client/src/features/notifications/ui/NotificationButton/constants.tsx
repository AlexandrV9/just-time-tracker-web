import type { ComponentType } from "react";
import type { NotificationStatus } from "./types";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  type IconProps,
} from "~/shared/ui";
import type { IconButtonProps } from "~/shared/ui/Button";

export const notificationStatusConfig: Record<
  NotificationStatus,
  { Icon: ComponentType<IconProps>; color: string }
> = {
  info: { Icon: InfoIcon, color: "cyan.400" },
  warning: { Icon: WarningIcon, color: "red.400" },
  success: { Icon: CheckCircleIcon, color: "green.400" },
};

export const triggerButtonProps: IconButtonProps = {
  p: 0,
  w: "40px",
  h: "40px",
  minW: "40px",
  borderRadius: "12px",
  shadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
  borderWidth: "1px",
  borderColor: "border.emphasized",
  color: "fg",
  variant: "outline" as const,
};
