import { Box, Button, Flex, Text } from "~/shared/ui";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { ActivityListView } from "~/entities/Activity";
import { useEffect, useRef } from "react";
import { Skeleton } from "./Skeleton";
import { useTranslation } from "~/shared/hooks";
import type { ActivityState } from "~/shared/api/services/activity/types";
import type { CalendarDay } from "~/shared/libs";
import { TodayActivityCard } from "./TodayActivityCard";

export type ActivityGroupDTO = {
  label: string;
  totalActiveTime: number;
  activities: ActivityState[];
  activeTimerCalendarDay?: CalendarDay;
  itemsHasMore?: boolean;
  itemsNextCursor?: string | null;
};

type TodayActivityGroupProps = {
  data: ActivityGroupDTO;
  currentActivityId?: string;
  highlightedActivityId?: string;
  hasMoreItems?: boolean;
  isLoadingMoreGroupItems?: boolean;
  onStart?: (data: ActivityState) => void;
  onSelect?: (data: ActivityState) => void;
  onPause?: (data: ActivityState) => void;
  onFinish?: (data: ActivityState) => void;
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

  const activityListItemRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (!highlightedActivityId || !activityListItemRef.current) return;

    activityListItemRef.current.scrollIntoView({
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
              ref={isHighlighted ? activityListItemRef : undefined}
            >
              <TodayActivityCard
                activity={activity}
                session={session}
                segment={segment}
                activeTimerCalendarDay={data.activeTimerCalendarDay}
                isHighlighted={isHighlighted}
                disableControls={disableControls}
                isSelected={isSelected}
                onStart={() => onStart?.({ activity, session, segment })}
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
