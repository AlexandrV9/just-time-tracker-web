import type { ActivityDTO } from "@to-do-list/shared";
import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Text } from "~/shared/ui";

import { ActivityCardControls } from "./ActivityCardControls";
import { useActivityCardData } from "./useActivityCardData";
import { ActivityCardView } from "~/entities/Activity";
import type { CalendarDay } from "~/shared/libs";

export type ActivityCardProps = {
  activity: ActivityDTO;
  /**
   * Это день в формате YYYY-MM-DD, для которого отображается карточка активности
   * Нужен для корректного отображения времени активности, т.к. время отображаемое на карточке - это время активности в рамках дня,
   * а не общее время активности
   */
  calendarDay?: CalendarDay;
  withControlButtons?: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
};

export const ActivityCard = ({
  activity,
  calendarDay,
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
      calendarDay,
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
