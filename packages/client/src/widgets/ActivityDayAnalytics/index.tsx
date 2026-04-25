import { BarSegment, useChart } from "@chakra-ui/charts";
import { Button, Popover } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ActivitySessionSegmentDTO } from "@to-do-list/shared";

import {
  ACTIVITY_SESSION_SEGMENTS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { Box, Calendar, Flex, Skeleton, Text } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  getCalendarDay,
  getDateIntervalByCalendarDay,
} from "~/shared/libs";

type ActivityDayAnalyticsProps = {
  activityId: string;
};

type ChartSegment = {
  name: string;
  value: number;
  color: string;
};

type ClippedSegment = {
  startMs: number;
  endMs: number;
  seconds: number;
  type: "active" | "pause";
};

const DAY_SECS = 86400;

const formatDuration = (seconds: number) =>
  convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));

const clipSegmentToDay = (
  segment: ActivitySessionSegmentDTO,
  dayFromMs: number,
  dayToMs: number,
): ClippedSegment | null => {
  const startMs = Date.parse(segment.startedAt);
  const naturalEndMs = segment.endedAt
    ? Date.parse(segment.endedAt)
    : Date.now();

  if (!Number.isFinite(startMs) || !Number.isFinite(naturalEndMs)) return null;

  const clippedStart = Math.max(startMs, dayFromMs);
  const clippedEnd = Math.min(naturalEndMs, dayToMs);

  if (clippedEnd <= clippedStart) return null;

  return {
    startMs: clippedStart,
    endMs: clippedEnd,
    seconds: Math.max(1, Math.round((clippedEnd - clippedStart) / 1000)),
    type: segment.type,
  };
};

export const ActivityDayAnalytics = ({
  activityId,
}: ActivityDayAnalyticsProps) => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const selectedCalendarDay = useMemo(
    () => getCalendarDay(selectedDate),
    [selectedDate],
  );

  const { fromDate, toDate } = useMemo(
    () => getDateIntervalByCalendarDay(selectedCalendarDay),
    [selectedCalendarDay],
  );

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDate),
    [i18n.language, selectedDate],
  );

  const segmentsQuery = useQuery({
    queryKey: [
      ACTIVITY_SESSION_SEGMENTS_QUERY_KEY,
      activityId,
      fromDate,
      toDate,
    ],
    queryFn: async () => {
      const response = await activityApiService.getActivitySessionSegments({
        activityId,
        fromDate,
        toDate,
      });

      if (!response.success) {
        throw new Error(response.message ?? "Failed to load session segments");
      }

      return response.data.segments;
    },
    enabled: !!activityId,
  });

  const { chartData, activeTotalSecs, pauseTotalSecs } = useMemo(() => {
    const timeFormatter = new Intl.DateTimeFormat(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
    });

    const dayFromMs = Date.parse(fromDate);
    const dayToMs = Date.parse(toDate);

    const clipped: ClippedSegment[] = (segmentsQuery.data ?? []).flatMap(
      (seg) => {
        const c = clipSegmentToDay(seg, dayFromMs, dayToMs);
        return c ? [c] : [];
      },
    );

    // Build full-day timeline filling gaps with neutral color
    const segments: ChartSegment[] = [];
    let cursor = dayFromMs;
    let activeSecs = 0;
    let pauseSecs = 0;

    let gapIdx = 0;

    for (const seg of clipped) {
      if (seg.startMs > cursor) {
        const gapSecs = Math.round((seg.startMs - cursor) / 1000);
        if (gapSecs > 0) {
          segments.push({
            name: `__gap__${gapIdx++}`,
            value: gapSecs,
            color: "gray.subtle",
          });
        }
      }

      const label =
        seg.type === "active"
          ? t("widgets.activityDayAnalytics.active")
          : t("widgets.activityDayAnalytics.pause");

      segments.push({
        name: `${label} ${timeFormatter.format(new Date(seg.startMs))}\u2013${timeFormatter.format(new Date(seg.endMs))}`,
        value: seg.seconds,
        color: seg.type === "active" ? "teal.solid" : "orange.solid",
      });

      if (seg.type === "active") activeSecs += seg.seconds;
      else pauseSecs += seg.seconds;

      cursor = seg.endMs;
    }

    // Trailing gap to fill the rest of the day
    if (cursor < dayToMs) {
      const gapSecs = Math.round((dayToMs - cursor) / 1000);
      if (gapSecs > 0) {
        segments.push({
          name: `__gap__${gapIdx++}`,
          value: gapSecs,
          color: "gray.subtle",
        });
      }
    }

    // If no segments at all – show the full day as a single neutral bar
    if (segments.length === 0) {
      segments.push({
        name: `__gap__${gapIdx++}`,
        value: DAY_SECS,
        color: "gray.subtle",
      });
    }

    return {
      chartData: segments,
      activeTotalSecs: activeSecs,
      pauseTotalSecs: pauseSecs,
    };
  }, [fromDate, i18n.language, segmentsQuery.data, t, toDate]);

  const chart = useChart({ data: chartData });

  const totalTrackedSecs = activeTotalSecs + pauseTotalSecs;

  const renderChart = () => {
    if (segmentsQuery.isPending) {
      return <Skeleton h="40px" borderRadius="lg" />;
    }

    if (segmentsQuery.isError) {
      return (
        <Text textStyle="sm" color="fg.error">
          {t("widgets.activityDayAnalytics.error")}
        </Text>
      );
    }

    return (
      <Box>
        <BarSegment.Root chart={chart}>
          <BarSegment.Content>
            <BarSegment.Bar />
          </BarSegment.Content>
        </BarSegment.Root>

        <Flex flexDirection="column" gap={1} mt={3}>
          {activeTotalSecs > 0 && (
            <Flex gap={2} alignItems="center">
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg="teal.500"
                flexShrink={0}
              />
              <Text textStyle="xs" color="fg.muted" flex={1}>
                {t("widgets.activityDayAnalytics.active")}
              </Text>
              <Text textStyle="xs" fontFamily="Roboto Mono, monospace">
                {formatDuration(activeTotalSecs)}
              </Text>
            </Flex>
          )}
          {pauseTotalSecs > 0 && (
            <Flex gap={2} alignItems="center">
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg="orange.500"
                flexShrink={0}
              />
              <Text textStyle="xs" color="fg.muted" flex={1}>
                {t("widgets.activityDayAnalytics.pause")}
              </Text>
              <Text textStyle="xs" fontFamily="Roboto Mono, monospace">
                {formatDuration(pauseTotalSecs)}
              </Text>
            </Flex>
          )}
          {totalTrackedSecs === 0 && (
            <Text textStyle="sm" color="fg.muted">
              {t("widgets.activityDayAnalytics.empty")}
            </Text>
          )}
        </Flex>
      </Box>
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={3} px={1} pt={2}>
      <Flex gap={1} alignItems="center" flexWrap="wrap">
        <Text textStyle="sm" fontWeight="bold" color="fg.muted">
          {t("widgets.activityDayAnalytics.showFor")}
        </Text>

        <Popover.Root
          open={isCalendarOpen}
          onOpenChange={(details) => setIsCalendarOpen(details.open)}
          positioning={{ placement: "bottom-start" }}
        >
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              size="xs"
              fontWeight="medium"
              px={1}
              height="auto"
              py="2px"
            >
              {dateLabel}
            </Button>
          </Popover.Trigger>
          <Popover.Positioner>
            <Popover.Content p={0} bg="transparent" border="none" w="auto">
              <Calendar
                selectedDate={selectedDate}
                onChangeSelectedDate={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }
                }}
              />
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>
      </Flex>

      <Flex justifyContent="space-between" gap={4}>
        <Text textStyle="sm" color="fg.muted">
          {t("widgets.activityDayAnalytics.total")}
        </Text>
        <Text
          textStyle="sm"
          fontWeight="bold"
          fontFamily="Roboto Mono, monospace"
        >
          {formatDuration(totalTrackedSecs)}
        </Text>
      </Flex>

      {renderChart()}
    </Box>
  );
};
