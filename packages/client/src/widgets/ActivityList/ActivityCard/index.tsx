import { useNavigate } from "@tanstack/react-router";
import type { ActivityDTO } from "@to-do-list/shared";
import { useMemo } from "react";
import { Box, Flex, PauseIcon, PlayIcon, Text } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import { formatDuration } from "~/shared/libs";
import { ActivityCardView } from "~/entities/Activity";

type ActivityCardProps = {
  activity: ActivityDTO;
};

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const activeTime = useMemo(
    () => formatDuration(Math.floor(activity.activeDurationMs / 1000), i18n.language),
    [activity.activeDurationMs, i18n.language],
  );

  const pauseTime = useMemo(
    () => formatDuration(Math.floor(activity.pauseDurationMs / 1000), i18n.language),
    [activity.pauseDurationMs, i18n.language],
  );

  return (
    <ActivityCardView
      onClick={() =>
        navigate({
          to: "/activities/$activityId",
          params: { activityId: activity.id },
        })
      }
    >
      <ActivityCardView.Body>
        <Flex flex="1" minH={0} flexDirection="column" gap={2}>
          <Text textStyle="md" fontWeight="bold" lineClamp={2}>
            {activity.title}
          </Text>
          {activity.description && (
            <Text color="fg.subtle" lineClamp={2}>
              {activity.description}
            </Text>
          )}
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
