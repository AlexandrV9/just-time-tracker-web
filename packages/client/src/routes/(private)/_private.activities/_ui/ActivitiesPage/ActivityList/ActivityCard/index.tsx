import { useNavigate } from "@tanstack/react-router";
import type { ActivityDTO } from "@to-do-list/shared";
import { useMemo } from "react";
import { IconButton } from "@chakra-ui/react";
import {
  ArrowRightIcon,
  Card,
  Flex,
  Text,
} from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

type ActivityCardProps = {
  activity: ActivityDTO;
};

const getDurationSeconds = (startDate: string, endDate: string | null | undefined): number => {
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 1000));
};

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const navigate = useNavigate();

  const displayedTime = useMemo(() => {
    const seconds = getDurationSeconds(activity.startDate, activity.endDate);
    return convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));
  }, [activity.startDate, activity.endDate]);

  const isTracking = !activity.endDate;

  return (
    <Card.Root
      p="1rem"
      borderRadius="2xl"
      gap={1}
      cursor="pointer"
      onClick={() =>
        navigate({
          to: "/activities/$activityId",
          params: { activityId: activity.id },
        })
      }
    >
      <Card.Body p={0} gap={2}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text textStyle="md" fontWeight="bold" lineClamp={2}>
            {activity.title}
          </Text>
          <IconButton variant="ghost" size="xs">
            <ArrowRightIcon />
          </IconButton>
        </Flex>
        {activity.description && (
          <Text color="fg.subtle" lineClamp={2}>
            {activity.description}
          </Text>
        )}
      </Card.Body>
      <Card.Footer p={0} justifyContent="space-between" alignItems="end">
        <Text color="fg.muted" textStyle="md" fontWeight="medium">
          Total:{" "}
          <Text
            as="span"
            color="fg"
            fontFamily="Roboto Mono, monospace"
          >
            {displayedTime}
          </Text>
        </Text>
        {isTracking && (
          <Text textStyle="xs" color="green.500" fontWeight="medium">
            Tracking
          </Text>
        )}
      </Card.Footer>
    </Card.Root>
  );
};
