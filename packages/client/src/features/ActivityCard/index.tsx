import type { ActivityDTO } from "@to-do-list/shared";
import { useMemo } from "react";
import { Flex, Text } from "~/shared/ui";

import { ActivityCardControls } from "./ActivityCardControls";
import { useDisplayedSeconds } from "./useDisplayedSeconds";
import { formatDurationLabel, resolveHasActiveSession } from "./utils";
import { ActivityCardView } from "~/entities/Activity";
import { Skeleton } from "./Skeleton";

export type ActivityCardProps = {
  activity: ActivityDTO;
  activeDurationMs: number;
  withControlButtons?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
};

export const ActivityCard = ({
  activity,
  activeDurationMs,
  withControlButtons = true,
  isSelected = false,
  onStart,
  onPause,
  onFinish,
  onClick,
}: ActivityCardProps) => {
  const hasActiveSession = resolveHasActiveSession({
    activityStatus: activity.status,
  });

  const displayedSeconds = useDisplayedSeconds({
    activeDurationMs,
    hasActiveSession,
  });

  const displayedTime = useMemo(
    () => formatDurationLabel(displayedSeconds),
    [displayedSeconds],
  );

  return (
    <ActivityCardView
      onClick={onClick}
      outline={isSelected ? "2px solid" : undefined}
      outlineColor={isSelected ? "purple.focusRing" : undefined}
    >
      <ActivityCardView.Body>
        <Flex flex="1" minH={0} justifyContent="space-between">
          <Text textStyle="md" fontWeight="bold" lineClamp={2}>
            {activity.title}
          </Text>
        </Flex>
      </ActivityCardView.Body>
      <ActivityCardView.Footer>
        <Text
          color="fg.muted"
          textStyle="sm"
          fontWeight="medium"
          fontFamily="Roboto Mono, monospace"
          userSelect="none"
        >
          {displayedTime}
        </Text>
        {withControlButtons && (
          <ActivityCardControls
            activityId={activity.id}
            hasActiveSession={hasActiveSession}
            sessionStatus={activity.status}
            onStart={onStart}
            onPause={onPause}
            onFinish={onFinish}
          />
        )}
      </ActivityCardView.Footer>
    </ActivityCardView>
  );
};

ActivityCard.Skeleton = Skeleton;
