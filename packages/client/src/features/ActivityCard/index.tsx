import type { ActivityDTO } from "@to-do-list/shared";
import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
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
  onStart?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
};

export const ActivityCard = ({
  activity,
  activeDurationMs,
  withControlButtons = true,
  onStart,
  onPause,
  onFinish,
}: ActivityCardProps) => {
  const navigate = useNavigate();

  const hasActiveSession = resolveHasActiveSession({
    activityStatus: activity.status,
  });

  const sessionStatus =
    activity.status === "active"
      ? "active"
      : activity.status === "paused"
        ? "paused"
        : undefined;

  const displayedSeconds = useDisplayedSeconds({ activeDurationMs, hasActiveSession });

  const displayedTime = useMemo(
    () => formatDurationLabel(displayedSeconds),
    [displayedSeconds],
  );

  const handleCardClick = useCallback(() => {
    navigate({
      to: "/activities/$activityId",
      params: { activityId: activity.id },
    });
  }, [navigate, activity.id]);

  return (
    <ActivityCardView onClick={handleCardClick}>
      <ActivityCardView.Body>
        <Flex flex="1" minH={0}>
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
          <ActivityCardControls
            activityId={activity.id}
            hasActiveSession={hasActiveSession}
            sessionStatus={sessionStatus}
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
