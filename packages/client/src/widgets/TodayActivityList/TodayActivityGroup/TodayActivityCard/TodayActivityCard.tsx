import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { useMemo } from "react";
import { keyframes } from "@emotion/react";
import { Box, Flex, Text, convertMillisecondsToSeconds } from "~/shared/ui";

import { ActivityCardControls } from "./ActivityCardControls";
import { formatDurationLabel } from "./utils";
import { ActivityCardView } from "~/entities/Activity";
import { Skeleton } from "./Skeleton";
import type { CalendarDay } from "~/shared/libs";
import { useTranslation } from "~/shared/hooks";
import { useDisplayedSessionSeconds } from "~/features";

const highlightFade = keyframes`
  0%   { outline-color: var(--chakra-colors-yellow-400) }
  70%  { outline-color: var(--chakra-colors-yellow-400) }
  100% { outline-color: transparent }
`;

export type TodayActivityCardProps = {
  activity: ActivityDTO;
  session?: ActivitySessionDTO | null;
  segment?: ActivitySessionSegmentDTO | null;
  /** When set, show snapshot totals for that calendar day (no live ticking). */
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

  const dayTotalLabel = useMemo(
    () =>
      formatDurationLabel(
        convertMillisecondsToSeconds(activity.activeDurationMs),
      ),
    [activity.activeDurationMs],
  );

  const showRunningOutline = sessionStatus === "active";

  const showSelectionOutline = isSelected && sessionStatus !== "active";

  const sessionDisplayedSeconds = useDisplayedSessionSeconds({
    session,
    segment,
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
