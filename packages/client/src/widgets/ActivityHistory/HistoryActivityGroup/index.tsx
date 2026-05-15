import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { Box, Button, Flex, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { ActivityListView } from "~/entities/Activity";
import { useEffect, useRef } from "react";
import { Skeleton } from "./Skeleton";
import { useTranslation } from "~/shared/hooks";
import type { ActivityGroupRow } from "~/shared/api/services/activity/types";
import type { CalendarDay } from "~/shared/libs";
import { HistoryActivityCard } from "./HistoryActivityCard";

export type ActivityGroupDTO = {
  label: string;
  totalActiveTime: number;
  activities: ActivityGroupRow[];
  activeTimerCalendarDay?: CalendarDay;
  itemsHasMore?: boolean;
  itemsNextCursor?: string | null;
};

type ActivityData = {
  activity: ActivityDTO;
  session: ActivitySessionDTO | null;
  segment: ActivitySessionSegmentDTO | null;
};

type HistoryActivityGroupProps = {
  data: ActivityGroupDTO;
  currentActivityId?: string;
  highlightedActivityId?: string;
  hasMoreItems?: boolean;
  isLoadingMoreGroupItems?: boolean;
  onSelect?: (data: ActivityData) => void;
  onLoadMoreGroupItems?: () => void;
};

export function HistoryActivityGroup({
  data,
  currentActivityId,
  highlightedActivityId,
  onSelect,
  hasMoreItems = false,
  isLoadingMoreGroupItems = false,
  onLoadMoreGroupItems,
}: HistoryActivityGroupProps) {
  const { t } = useTranslation();

  const highlightedItemRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (!highlightedActivityId || !highlightedItemRef.current) return;

    highlightedItemRef.current.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
  }, [highlightedActivityId]);

  const displayedActiveTotalTime = convertTimeObjectToTimeString(
    convertSecondsToTimeObject(data.totalActiveTime),
  );

  return (
    <Box display="flex" flexDirection="column" gap="0.75rem">
      <Flex justifyContent="space-between" alignItems="center" gap="0.5rem">
        <Text textStyle="sm" fontWeight="bold" color="fg.muted">
          {data.label}
        </Text>
        <Flex gap="0.25rem" alignItems="center" wrap="wrap" justify="flex-end">
          <Text textStyle="sm" color="fg.muted">
            {t("widgets.activityGroup.totalActiveTime")}:
          </Text>
          <Text
            textStyle="sm"
            fontWeight="bold"
            fontFamily="Roboto Mono, monospace"
          >
            {displayedActiveTotalTime}
          </Text>
        </Flex>
      </Flex>
      <ActivityListView>
        {data.activities.map(({ activity, session = null, segment = null }) => {
          const isCurrentActivity = activity.id === currentActivityId;
          const isHighlighted = highlightedActivityId === activity.id;
          const isSelected = isCurrentActivity;

          return (
            <ActivityListView.Item
              key={activity.id}
              ref={isHighlighted ? highlightedItemRef : undefined}
            >
              <HistoryActivityCard
                activity={activity}
                session={session}
                segment={segment}
                activeTimerCalendarDay={data.activeTimerCalendarDay}
                isHighlighted={isHighlighted}
                isSelected={isSelected}
                onClick={() => onSelect?.({ activity, session, segment })}
              />
            </ActivityListView.Item>
          );
        })}
      </ActivityListView>
      {hasMoreItems && onLoadMoreGroupItems ? (
        <Button
          variant="outline"
          size="sm"
          alignSelf="flex-start"
          borderRadius="xl"
          loading={isLoadingMoreGroupItems}
          disabled={isLoadingMoreGroupItems}
          onClick={onLoadMoreGroupItems}
        >
          {t("widgets.activityGroup.loadMoreButton")}
        </Button>
      ) : null}
    </Box>
  );
}

HistoryActivityGroup.Skeleton = Skeleton;
