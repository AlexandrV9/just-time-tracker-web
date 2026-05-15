import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { useMemo } from "react";
import { keyframes } from "@emotion/react";
import { Box, Flex, Text } from "~/shared/ui";

import { ActivityCardControls } from "./ActivityCardControls";
import { useDayDisplayedSeconds } from "./useDayDisplayedSeconds";
import { useDisplayedSeconds } from "./useDisplayedSeconds";
import { formatDurationLabel } from "./utils";
import { ActivityCardView } from "~/entities/Activity";
import { Skeleton } from "./Skeleton";
import {
  getDateIntervalByCalendarDay,
  type CalendarDay,
} from "~/shared/libs";
import { useTranslation } from "~/shared/hooks";

const highlightFade = keyframes`
  0%   { outline-color: var(--chakra-colors-yellow-400) }
  70%  { outline-color: var(--chakra-colors-yellow-400) }
  100% { outline-color: transparent }
`;

export type TodayActivityCardProps = {
  activity: ActivityDTO;
  session?: ActivitySessionDTO | null;
  segment?: ActivitySessionSegmentDTO | null;
  /** Today's calendar day (clips live elapsed in the «today» summary line). */
  activeTimerCalendarDay?: CalendarDay;
  disableControls?: boolean;
  finishOnly?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
};

export const TodayActivityCard = ({
  activity,
  session = null,
  segment = null,
  activeTimerCalendarDay,
  finishOnly = false,
  disableControls = false,
  isSelected = false,
  isHighlighted = false,
  onStart,
  onPause,
  onFinish,
  onClick,
}: TodayActivityCardProps) => {
  const { t } = useTranslation();

  const sessionStatus = session?.status;

  const hasRunningSession =
    sessionStatus === "active" || sessionStatus === "paused";

  const hasActiveSession =
    activity.status === "active" || activity.status === "paused";

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

  const dayTotalLabel = useMemo(
    () => formatDurationLabel(dayDisplayedSeconds),
    [dayDisplayedSeconds],
  );

  const showRunningOutline = sessionStatus === "active";

  const showSelectionOutline = isSelected && sessionStatus !== "active";

  const sessionDisplayedSeconds = useDisplayedSeconds({
    session,
    segment,
    activityId: activity.id,
  });

  const sessionActiveTime = useMemo(
    () => formatDurationLabel(sessionDisplayedSeconds),
    [sessionDisplayedSeconds],
  );

  return (
    <ActivityCardView
      onClick={onClick}
      cursor={disableControls ? "default" : "pointer"}
      _hover={disableControls ? undefined : { bg: "bg.subtle" }}
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
          {activeTimerCalendarDay != null ? (
            <Text textStyle="xs" color="fg.muted">
              {t("widgets.activityCard.dayTotal", { time: dayTotalLabel })}
            </Text>
          ) : null}
        </Flex>
      </ActivityCardView.Body>
      <ActivityCardView.Footer>
        <Text
          color="fg.muted"
          textStyle="sm"
          fontWeight="medium"
          fontFamily="Roboto Mono, monospace"
        >
          {sessionActiveTime}
        </Text>
        <Box
          opacity={disableControls ? 0.38 : 1}
          pointerEvents={disableControls ? "none" : "auto"}
          cursor={disableControls ? "not-allowed" : undefined}
          display="flex"
          alignItems="center"
        >
          <ActivityCardControls
            activityId={activity.id}
            hasActiveSession={hasRunningSession}
            sessionStatus={activity.status}
            finishOnly={finishOnly}
            onStart={onStart}
            onPause={onPause}
            onFinish={onFinish}
          />
        </Box>
      </ActivityCardView.Footer>
    </ActivityCardView>
  );
};

TodayActivityCard.Skeleton = Skeleton;
