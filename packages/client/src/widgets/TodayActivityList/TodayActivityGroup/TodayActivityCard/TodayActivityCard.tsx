import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
  ActivityStatusDTO,
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
import shineStyles from "~/shared/styles/shineRing.module.css";

const highlightFade = keyframes`
  0%   { border-color: var(--chakra-colors-yellow-400) }
  70%  { border-color: var(--chakra-colors-yellow-400) }
  100% { border-color: transparent }
`;

export type TodayActivityCardProps = {
  activity: ActivityDTO;
  session?: ActivitySessionDTO | null;
  segment?: ActivitySessionSegmentDTO | null;
  /** When set, show snapshot totals for that calendar day (no live ticking). */
  activeTimerCalendarDay?: CalendarDay;
  /** Disables start / pause controls when another activity is running. */
  disableStartPause?: boolean;
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
  disableStartPause = false,
  isSelected = false,
  isHighlighted = false,
  onStart,
  onPause,
  onFinish,
  onClick,
}: TodayActivityCardProps) => {
  const { t } = useTranslation();

  const sessionStatus = session?.status;

  const controlsSessionStatus: ActivityStatusDTO =
    sessionStatus === "active" || sessionStatus === "paused"
      ? sessionStatus
      : "idle";

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

  const card = (
    <ActivityCardView
      onClick={onClick}
      cursor="pointer"
      _hover={{ bg: "bg.subtle" }}
      borderRadius="8px"
      border="2px solid border.muted"
      borderColor={
        showSelectionOutline
          ? "border.emphasized"
          : isHighlighted
            ? "transparent"
            : undefined
      }
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
        <Box display="flex" alignItems="center">
          <ActivityCardControls
            activityId={activity.id}
            hasActiveSession={hasRunningSession}
            sessionStatus={controlsSessionStatus}
            finishOnly={finishOnly}
            disableStartPause={disableStartPause}
            onStart={onStart}
            onPause={onPause}
            onFinish={onFinish}
          />
        </Box>
      </ActivityCardView.Footer>
    </ActivityCardView>
  );

  return (
    <Box
      className={
        showRunningOutline
          ? `${shineStyles.shineRingCardShell} ${shineStyles.shineRingCardActive}`
          : shineStyles.shineRingCardShell
      }
      flex={1}
      w="100%"
      display="flex"
      flexDirection="column"
    >
      {card}
    </Box>
  );
};

TodayActivityCard.Skeleton = Skeleton;
