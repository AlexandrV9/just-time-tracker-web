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
import { TodayActivityCard } from "./TodayActivityCard";

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

type TodayActivityGroupProps = {
  data: ActivityGroupDTO;
  currentActivityId?: string;
  highlightedActivityId?: string;
  hasMoreItems?: boolean;
  isLoadingMoreGroupItems?: boolean;
  onStart?: (activity: ActivityDTO) => void;
  onSelect?: (data: ActivityData) => void;
  onPause?: (data: ActivityData) => void;
  onFinish?: (data: ActivityData) => void;
  onLoadMoreGroupItems?: () => void;
};

export function TodayActivityGroup({
  data,
  onStart,
  onPause,
  onFinish,
  currentActivityId,
  highlightedActivityId,
  onSelect,
  hasMoreItems = false,
  isLoadingMoreGroupItems = false,
  onLoadMoreGroupItems,
}: TodayActivityGroupProps) {
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
          const disableControls =
            data.activities.some((row) => row.segment?.type === "active") &&
            segment?.type !== "active";

          return (
            <ActivityListView.Item
              key={activity.id}
              ref={isHighlighted ? highlightedItemRef : undefined}
            >
              <TodayActivityCard
                activity={activity}
                session={session}
                segment={segment}
                activeTimerCalendarDay={data.activeTimerCalendarDay}
                isHighlighted={isHighlighted}
                disableControls={disableControls}
                isSelected={isSelected}
                onStart={() => onStart?.(activity)}
                onClick={() => onSelect?.({ activity, session, segment })}
                onPause={() => onPause?.({ activity, session, segment })}
                onFinish={() => onFinish?.({ activity, session, segment })}
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

TodayActivityGroup.Skeleton = Skeleton;
