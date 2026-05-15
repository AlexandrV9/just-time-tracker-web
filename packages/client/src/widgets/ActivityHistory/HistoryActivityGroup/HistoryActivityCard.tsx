import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { useMemo } from "react";
import { keyframes } from "@emotion/react";
import { Box, Flex, PauseIcon, PlayIcon, Text } from "~/shared/ui";

import { useDayDisplayedSeconds } from "./useDayDisplayedSeconds";
import { formatDurationLabel } from "./utils";
import { ActivityCardView } from "~/entities/Activity";
import { Skeleton } from "./Skeleton";
import {
  getDateIntervalByCalendarDay,
  type CalendarDay,
} from "~/shared/libs";

const highlightFade = keyframes`
  0%   { outline-color: var(--chakra-colors-yellow-400) }
  70%  { outline-color: var(--chakra-colors-yellow-400) }
  100% { outline-color: transparent }
`;

export type HistoryActivityCardProps = {
  activity: ActivityDTO;
  session?: ActivitySessionDTO | null;
  segment?: ActivitySessionSegmentDTO | null;
  activeTimerCalendarDay?: CalendarDay;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
};

export const HistoryActivityCard = ({
  activity,
  session = null,
  segment = null,
  activeTimerCalendarDay,
  isSelected = false,
  isHighlighted = false,
  onClick,
}: HistoryActivityCardProps) => {
  const hasActiveSession =
    activity.status === "active" || activity.status === "paused";

  const sessionStatus = session?.status;

  const showRunningOutline = sessionStatus === "active";

  const showSelectionOutline = isSelected && sessionStatus !== "active";

  const activeSegmentStartedAt =
    segment?.type === "active" ? segment.startedAt : null;

  const liveElapsedClipFromIso =
    activeTimerCalendarDay != null && hasActiveSession
      ? getDateIntervalByCalendarDay(activeTimerCalendarDay).fromDate
      : null;

  const dayDisplayedSeconds = useDayDisplayedSeconds({
    activityId: activity.id,
    activeDurationMs: activity.activeDurationMs,
    hasActiveSession,
    startedAt: activeSegmentStartedAt ?? undefined,
    liveElapsedClipFromIso,
  });

  const activeTime = useMemo(
    () => formatDurationLabel(dayDisplayedSeconds),
    [dayDisplayedSeconds],
  );

  const pauseTime = useMemo(
    () =>
      formatDurationLabel(Math.floor((activity.pauseDurationMs ?? 0) / 1000)),
    [activity.pauseDurationMs],
  );

  return (
    <ActivityCardView
      onClick={onClick}
      cursor="pointer"
      _hover={{ bg: "bg.subtle" }}
      outline={
        showRunningOutline || showSelectionOutline || isHighlighted
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
        <Flex
          flex="1"
          minH={0}
          justifyContent="space-between"
          direction="column"
          gap={2}
        >
          <Text textStyle="md" fontWeight="bold" lineClamp={2}>
            {activity.title}
          </Text>
        </Flex>
      </ActivityCardView.Body>
      <ActivityCardView.Footer>
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
      </ActivityCardView.Footer>
    </ActivityCardView>
  );
};

HistoryActivityCard.Skeleton = Skeleton;
