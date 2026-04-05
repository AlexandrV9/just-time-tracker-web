import type { ActivityDTO } from "@to-do-list/shared";
import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, Flex, Text } from "~/shared/ui";

import { ActivityCardControls } from "./ActivityCardControls";
import { useActivityCardData } from "./useActivityCardData";
import { useQuery } from "@tanstack/react-query";
import {
  ACTIVITY_SESSIONS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";

export type ActivityCardProps = {
  activity: ActivityDTO;
  dayKey: string;
  showControlButtons: boolean;
  onStart?: (activityId: ActivityDTO["id"]) => void;
  onPause?: (activityId: ActivityDTO["id"]) => void;
  onFinish?: (activityId: ActivityDTO["id"]) => void;
};

export const ActivityCard = ({
  activity,
  dayKey,
  showControlButtons,
  onStart,
  onPause,
  onFinish,
}: ActivityCardProps) => {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, activity.currentSessionId],
    queryFn: () =>
      activityApiService.getActivitySession({
        id: activity.currentSessionId!,
      }),
    enabled: Boolean(activity.currentSessionId),
    select: (response) => (response.success ? response.data : undefined),
  });

  const { displayedTime } = useActivityCardData({
    activityId: activity.id,
    activityCurrentSessionId: activity.currentSessionId,
    dayKey,
  });

  const handleCardClick = useCallback(() => {
    navigate({
      to: "/activities/$activityId",
      params: { activityId: activity.id },
    });
  }, [navigate, activity.id]);

  return (
    <Card.Root
      flex="1"
      w="100%"
      minH="clamp(7.5rem, 28vw, 10rem)"
      h="100%"
      display="flex"
      flexDirection="column"
      p="0.8rem"
      borderRadius="2xl"
      gap={1}
      cursor="pointer"
      onClick={handleCardClick}
      overflow="hidden"
      _hover={{ bg: "bg.subtle" }}
    >
      <Card.Body p={0} flex="1" display="flex" flexDirection="column" minH={0}>
        <Flex flex="1" minH={0}>
          <Text textStyle="md" fontWeight="bold" lineClamp={2}>
            {activity.title}
          </Text>
        </Flex>
      </Card.Body>
      <Card.Footer
        p={0}
        justifyContent="space-between"
        alignItems="end"
        mt="auto"
      >
        <Text
          color="fg.muted"
          textStyle="sm"
          fontWeight="medium"
          fontFamily="Roboto Mono, monospace"
        >
          {displayedTime}
        </Text>
        {showControlButtons && (
          <ActivityCardControls
            activity={activity}
            sessionStatus={session?.status}
            onStart={onStart}
            onPause={onPause}
            onFinish={onFinish}
          />
        )}
      </Card.Footer>
    </Card.Root>
  );
};
