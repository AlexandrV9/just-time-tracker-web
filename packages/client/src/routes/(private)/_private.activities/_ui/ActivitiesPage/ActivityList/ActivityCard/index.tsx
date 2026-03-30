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

const getTotalTrackedSeconds = (a: ActivityDTO): number =>
  Math.floor((a.activeDurationMs + a.pauseDurationMs) / 1000);

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const navigate = useNavigate();

  const displayedTime = useMemo(() => {
    const seconds = getTotalTrackedSeconds(activity);
    return convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));
  }, [activity.activeDurationMs, activity.pauseDurationMs]);

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
      </Card.Footer>
    </Card.Root>
  );
};
