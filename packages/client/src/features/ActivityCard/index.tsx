import type { ActivityDTO } from "@to-do-list/shared";
import { useMemo } from "react";
import { keyframes } from "@emotion/react";
import { Box, Flex, PauseIcon, PlayIcon, Text } from "~/shared/ui";

import { ActivityCardControls } from "./ActivityCardControls";
import { useDisplayedSeconds } from "./useDisplayedSeconds";
import { formatDurationLabel, resolveHasActiveSession } from "./utils";
import { ActivityCardView } from "~/entities/Activity";
import { Skeleton } from "./Skeleton";

// background-color: color-mix(in srgb, var(--chakra-colors-yellow-400) 15%, transparent

const highlightFade = keyframes`
  0%   { outline-color: var(--chakra-colors-yellow-400) }
  70%  { outline-color: var(--chakra-colors-yellow-400) }
  100% { outline-color: transparent }
`;

export type ActivityCardProps = {
  activity: ActivityDTO;
  activeDurationMs?: number;
  pauseDurationMs?: number;
  activeSegmentStartedAt?: string | null;
  withControlButtons?: boolean;
  finishOnly?: boolean;
  mutedControls?: boolean;
  isSelected?: boolean;
  isInteractive?: boolean;
  isRunning?: boolean;
  isHighlighted?: boolean;
  showDurationBreakdown?: boolean;
  onClick?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
};

export const ActivityCard = ({
  activity,
  activeDurationMs = 0,
  pauseDurationMs = 0,
  activeSegmentStartedAt = null,
  withControlButtons = true,
  finishOnly = false,
  mutedControls = false,
  isSelected = false,
  isInteractive = true,
  isRunning,
  isHighlighted = false,
  showDurationBreakdown = false,
  onStart,
  onPause,
  onFinish,
  onClick,
}: ActivityCardProps) => {
  const hasActiveSession = resolveHasActiveSession({
    activityStatus: activity.status,
  });

  const showRunningOutline = isRunning ?? hasActiveSession;
  const showSelectionOutline = isSelected && !hasActiveSession;

  const displayedSeconds = useDisplayedSeconds({
    activityId: activity.id,
    activeDurationMs,
    hasActiveSession,
    startedAt: activeSegmentStartedAt ?? undefined,
  });

  const activeTime = useMemo(
    () => formatDurationLabel(displayedSeconds),
    [displayedSeconds],
  );

  const pauseTime = useMemo(
    () => formatDurationLabel(Math.floor((pauseDurationMs ?? 0) / 1000)),
    [pauseDurationMs],
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
            : isHighlighted
              ? "2px solid"
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
      css={
        isHighlighted
          ? { animation: `${highlightFade} 1.2s ease forwards` }
          : undefined
      }
    >
      <ActivityCardView.Body>
        <Flex flex="1" minH={0} justifyContent="space-between">
          <Text textStyle="md" fontWeight="bold" lineClamp={2}>
            {activity.title}
          </Text>
        </Flex>
      </ActivityCardView.Body>
      <ActivityCardView.Footer>
        {showDurationBreakdown ? (
          <Flex justifyContent="flex-end" gap="0.5rem" w="full" flexWrap="wrap">
            <Flex align="center" gap="0.2rem" color="fg.muted">
              <Box color="orange.solid">
                <PauseIcon size={16} />
              </Box>
              <Text
                textStyle="xs"
                fontWeight="medium"
                fontFamily="Roboto Mono, monospace"
              >
                {pauseTime}
              </Text>
            </Flex>
            <Flex align="center" gap="0.2rem" color="fg.muted">
              <Box color="green.solid">
                <PlayIcon size={16} />
              </Box>
              <Text
                textStyle="xs"
                fontWeight="medium"
                fontFamily="Roboto Mono, monospace"
              >
                {activeTime}
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Text
            color="fg.muted"
            textStyle="sm"
            fontWeight="medium"
            fontFamily="Roboto Mono, monospace"
          >
            {activeTime}
          </Text>
        )}
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
              finishOnly={finishOnly}
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
