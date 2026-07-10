import type { ComponentType } from "react";
import type { NotificationStatus } from "./types";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  type IconProps,
} from "~/shared/ui";

export const notificationStatusConfig: Record<
  NotificationStatus,
  { Icon: ComponentType<IconProps>; color: string }
> = {
  info: { Icon: InfoIcon, color: "cyan.400" },
  warning: { Icon: WarningIcon, color: "red.400" },
  success: { Icon: CheckCircleIcon, color: "green.400" },
};
