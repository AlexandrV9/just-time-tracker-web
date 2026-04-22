import type { ActivityDTO } from "@to-do-list/shared";
import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Text } from "~/shared/ui";

import { ActivityCardControls } from "./ActivityCardControls";
import { useActivityCardData } from "./useActivityCardData";
import { ActivityCardView } from "~/entities/Activity";
import { Skeleton } from "./Skeleton";

export type PreloadedAnalytics = {
  currentActiveMs: number;
  fetchedAtMs: number;
};

export type ActivityCardProps = {
  activity: ActivityDTO;
  withControlButtons?: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
};

export const ActivityCard = ({
  activity,
  withControlButtons = true,
  onStart,
  onPause,
  onFinish,
}: ActivityCardProps) => {
  const navigate = useNavigate();

  const { displayedTime, sessionStatus, hasActiveSession } =
    useActivityCardData({
      activityId: activity.id,
      currentSessionId: activity.currentSessionId,
      activityStatus: activity.status,
      preloadedAnalytics: {
        currentActiveMs: activity.activeDurationMs,
        fetchedAtMs: 0,
      },
    });

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
