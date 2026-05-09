import type { ActivityDTO } from "@to-do-list/shared";
import { useMemo } from "react";
import { Box, Flex, Text } from "~/shared/ui";

import { ActivityCardControls } from "./ActivityCardControls";
import { useDisplayedSeconds } from "./useDisplayedSeconds";
import { formatDurationLabel, resolveHasActiveSession } from "./utils";
import { ActivityCardView } from "~/entities/Activity";
import { Skeleton } from "./Skeleton";

export type ActivityCardProps = {
  activity: ActivityDTO;
  activeDurationMs: number;
  activeSegmentStartedAt?: string | null;
  withControlButtons?: boolean;
  mutedControls?: boolean;
  isSelected?: boolean;
  isInteractive?: boolean;
  onClick?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
};

export const ActivityCard = ({
  activity,
  activeDurationMs,
  activeSegmentStartedAt,
  withControlButtons = true,
  mutedControls = false,
  isSelected = false,
  isInteractive = true,
  onStart,
  onPause,
  onFinish,
  onClick,
}: ActivityCardProps) => {
  const hasActiveSession = resolveHasActiveSession({
    activityStatus: activity.status,
  });

  const showRunningOutline = hasActiveSession;
  const showSelectionOutline = isSelected && !hasActiveSession;

  const displayedSeconds = useDisplayedSeconds({
    activityId: activity.id,
    activeDurationMs,
    hasActiveSession,
    startedAt: activeSegmentStartedAt ?? undefined,
  });

  const displayedTime = useMemo(
    () => formatDurationLabel(displayedSeconds),
    [displayedSeconds],
  );

  return (
    <ActivityCardView
      onClick={onClick}
      cursor={isInteractive ? "pointer" : "default"}
      _hover={isInteractive ? { bg: "bg.subtle" } : {}}
      outline={
        showRunningOutline
          ? "2px solid"
          : showSelectionOutline
            ? "1px solid"
            : undefined
      }
      outlineColor={
        showRunningOutline
          ? "purple.focusRing"
          : showSelectionOutline
            ? "border.emphasized"
            : undefined
      }
      outlineOffset={showSelectionOutline ? "0px" : undefined}
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
        >
          {displayedTime}
        </Text>
        {withControlButtons && (
          <Box
            opacity={mutedControls ? 0.38 : 1}
            pointerEvents={mutedControls ? "none" : "auto"}
            cursor={mutedControls ? "not-allowed" : undefined}
            display="flex"
            alignItems="center"
          >
            <ActivityCardControls
              activityId={activity.id}
              hasActiveSession={hasActiveSession}
              sessionStatus={activity.status}
              onStart={onStart}
              onPause={onPause}
              onFinish={onFinish}
            />
          </Box>
        )}
      </ActivityCardView.Footer>
    </ActivityCardView>
  );
};

ActivityCard.Skeleton = Skeleton;
