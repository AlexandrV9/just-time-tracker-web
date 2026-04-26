import { useDialog } from "@ark-ui/react";
import { Badge, IconButton } from "@chakra-ui/react";
import { Button, Popover } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import type {
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { isValid, parseISO } from "date-fns";
import { LuChevronDown } from "react-icons/lu";

import {
  ACTIVITY_SESSIONS_QUERY_KEY,
  ACTIVITY_SESSION_SEGMENTS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import {
  Accordion,
  Box,
  Calendar,
  Flex,
  Skeleton,
  Text,
  toast,
  TrashIcon,
} from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  getCalendarDay,
  getDateIntervalByCalendarDay,
} from "~/shared/libs";

import { ActivitySessionBar } from "./ActivitySessionBar";
import { DeleteSessionDialog } from "./DeleteSessionDialog";

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
  sessionId: string;
};

type SessionChart = {
  session: ActivitySessionDTO;
  sessionStartMs: number;
  sessionEndMs: number;
  barFromMs: number;
  barToMs: number;
  chartData: ChartSegment[];
  activeSecs: number;
  pauseSecs: number;
  label: string;
};

type DayChart = {
  chartData: ChartSegment[];
  activeSecs: number;
  pauseSecs: number;
  label: string;
};

const formatDuration = (seconds: number) =>
  convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));

const STEP_MINUTES = 15;
const STEP_MS = STEP_MINUTES * 60 * 1000;

const floorToStepMs = (ms: number) => Math.floor(ms / STEP_MS) * STEP_MS;

const ceilToStepMs = (ms: number) => {
  const remainder = ms % STEP_MS;
  if (remainder === 0) return ms;
  return ms + (STEP_MS - remainder);
};

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
    sessionId: segment.sessionId,
  };
};

export type ActivityAnalyticsProps = {
  activityId: string;
};

export const ActivityAnalytics = ({ activityId }: ActivityAnalyticsProps) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { date: dateFromSearchQuery } = useSearch({
    from: "/(private)/_private/activities/$activityId",
  });

  const deleteDialog = useDialog();

  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    label: string;
    durationLabel: string;
  } | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (!dateFromSearchQuery) {
      return new Date();
    }

    const parsedDate = parseISO(dateFromSearchQuery);

    return isValid(parsedDate) ? parsedDate : new Date();
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { mutate: deleteSession, isPending: isDeletingSession } = useMutation({
    mutationFn: async (id: string) => {
      const res = await activityApiService.deleteActivitySession({ id });

      if (!res.success) {
        throw new Error(res.message ?? "Failed to delete session");
      }

      return res.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, activityId],
      });
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_SESSION_SEGMENTS_QUERY_KEY, activityId],
      });
      toast.success(t("widgets.activityAnalytics.deleteSessionSuccess"));
    },
    onError: () => {
      toast.error(t("widgets.activityAnalytics.deleteSessionError"));
    },
  });

  const handleRequestDeleteSession = useCallback(
    (s: SessionChart) => {
      setSessionToDelete({
        id: s.session.id,
        label: s.label,
        durationLabel: formatDuration(s.activeSecs + s.pauseSecs),
      });
      deleteDialog.setOpen(true);
    },
    [deleteDialog],
  );

  const handleConfirmDeleteSession = useCallback(() => {
    if (!sessionToDelete) return;
    deleteSession(sessionToDelete.id);
    setSessionToDelete(null);
  }, [deleteSession, sessionToDelete]);

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

  const sessionsQuery = useQuery({
    queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, activityId, fromDate, toDate],
    queryFn: async () => {
      const response = await activityApiService.getActivitySessions({
        activityId,
        fromDate,
        toDate,
      });

      if (!response.success) {
        throw new Error(response.message ?? "Failed to load sessions");
      }

      return response.data.sessions;
    },
    enabled: !!activityId,
  });

  const { sessions, dayChart, activeTotalSecs, pauseTotalSecs } =
    useMemo(() => {
      const timeFormatter = new Intl.DateTimeFormat(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
      });

      const dayFromMs = Date.parse(fromDate);
      const dayToMs = Date.parse(toDate);

      const clippedSegments: ClippedSegment[] = (
        segmentsQuery.data ?? []
      ).flatMap((seg) => {
        const c = clipSegmentToDay(seg, dayFromMs, dayToMs);
        return c ? [c] : [];
      });

      const segsInDay = [...clippedSegments].sort(
        (a, b) => a.startMs - b.startMs,
      );
      const dayChartData: ChartSegment[] = [];
      let dayActiveSecs = 0;
      let dayPauseSecs = 0;
      let dayGapIdx = 0;
      const dayBarFromMs =
        segsInDay.length > 0
          ? Math.max(dayFromMs, floorToStepMs(segsInDay[0]!.startMs))
          : dayFromMs;
      const dayBarToMs =
        segsInDay.length > 0
          ? Math.min(dayToMs, ceilToStepMs(segsInDay.at(-1)!.endMs))
          : dayToMs;

      let cursor = dayBarFromMs;

      for (const seg of segsInDay) {
        if (seg.startMs > cursor) {
          const gapSecs = Math.round((seg.startMs - cursor) / 1000);
          if (gapSecs > 0) {
            dayChartData.push({
              name: `__gap__day__${dayGapIdx++}`,
              value: gapSecs,
              color: "gray.subtle",
            });
          }
        }

        const label =
          seg.type === "active"
            ? t("widgets.activityAnalytics.active")
            : t("widgets.activityAnalytics.pause");

        dayChartData.push({
          name: `${label} ${timeFormatter.format(new Date(seg.startMs))}\u2013${timeFormatter.format(new Date(seg.endMs))}`,
          value: seg.seconds,
          color: seg.type === "active" ? "teal.solid" : "orange.solid",
        });

        if (seg.type === "active") dayActiveSecs += seg.seconds;
        else dayPauseSecs += seg.seconds;

        cursor = seg.endMs;
      }

      if (cursor < dayBarToMs) {
        const gapSecs = Math.round((dayBarToMs - cursor) / 1000);
        if (gapSecs > 0) {
          dayChartData.push({
            name: `__gap__day__${dayGapIdx++}`,
            value: gapSecs,
            color: "gray.subtle",
          });
        }
      }

      if (dayChartData.length === 0) {
        dayChartData.push({
          name: `__gap__day__${dayGapIdx++}`,
          value: Math.max(1, Math.round((dayBarToMs - dayBarFromMs) / 1000)),
          color: "gray.subtle",
        });
      }

      const sessionsInDay: SessionChart[] = (sessionsQuery.data ?? [])
        .flatMap((s) => {
          const startedAtMs = Date.parse(s.startedAt);
          const naturalEndMs = s.endedAt ? Date.parse(s.endedAt) : Date.now();
          if (!Number.isFinite(startedAtMs) || !Number.isFinite(naturalEndMs)) {
            return [];
          }

          const sessionStartMs = Math.max(startedAtMs, dayFromMs);
          const sessionEndMs = Math.min(naturalEndMs, dayToMs);
          if (sessionEndMs <= sessionStartMs) return [];

          const barFromMs = Math.max(dayFromMs, floorToStepMs(sessionStartMs));
          const barToMs = Math.min(dayToMs, ceilToStepMs(sessionEndMs));

          const segs = clippedSegments
            .filter((seg) => seg.sessionId === s.id)
            .map((seg) => ({
              ...seg,
              startMs: Math.max(seg.startMs, sessionStartMs),
              endMs: Math.min(seg.endMs, sessionEndMs),
            }))
            .flatMap((seg) => {
              if (seg.endMs <= seg.startMs) return [];
              return [
                {
                  ...seg,
                  seconds: Math.max(
                    1,
                    Math.round((seg.endMs - seg.startMs) / 1000),
                  ),
                },
              ];
            })
            .sort((a, b) => a.startMs - b.startMs);

          let cursor = barFromMs;
          let activeSecs = 0;
          let pauseSecs = 0;
          let gapIdx = 0;

          const chartData: ChartSegment[] = [];

          for (const seg of segs) {
            if (seg.startMs > cursor) {
              const gapSecs = Math.round((seg.startMs - cursor) / 1000);
              if (gapSecs > 0) {
                chartData.push({
                  name: `__gap__${s.id}__${gapIdx++}`,
                  value: gapSecs,
                  color: "gray.subtle",
                });
              }
            }

            const label =
              seg.type === "active"
                ? t("widgets.activityAnalytics.active")
                : t("widgets.activityAnalytics.pause");

            chartData.push({
              name: `${label} ${timeFormatter.format(new Date(seg.startMs))}\u2013${timeFormatter.format(new Date(seg.endMs))}`,
              value: seg.seconds,
              color: seg.type === "active" ? "teal.solid" : "orange.solid",
            });

            if (seg.type === "active") activeSecs += seg.seconds;
            else pauseSecs += seg.seconds;

            cursor = seg.endMs;
          }

          if (cursor < barToMs) {
            const gapSecs = Math.round((barToMs - cursor) / 1000);
            if (gapSecs > 0) {
              chartData.push({
                name: `__gap__${s.id}__${gapIdx++}`,
                value: gapSecs,
                color: "gray.subtle",
              });
            }
          }

          if (chartData.length === 0) {
            chartData.push({
              name: `__gap__${s.id}__${gapIdx++}`,
              value: Math.max(1, Math.round((barToMs - barFromMs) / 1000)),
              color: "gray.subtle",
            });
          }

          return [
            {
              session: s,
              sessionStartMs,
              sessionEndMs,
              barFromMs,
              barToMs,
              chartData,
              activeSecs,
              pauseSecs,
              label: `${timeFormatter.format(new Date(barFromMs))}\u2013${timeFormatter.format(new Date(barToMs))}`,
            },
          ];
        })
        .sort((a, b) => a.sessionStartMs - b.sessionStartMs);

      const totalActive = sessionsInDay.reduce(
        (acc, s) => acc + s.activeSecs,
        0,
      );
      const totalPause = sessionsInDay.reduce((acc, s) => acc + s.pauseSecs, 0);

      return {
        sessions: sessionsInDay,
        dayChart: {
          chartData: dayChartData,
          activeSecs: dayActiveSecs,
          pauseSecs: dayPauseSecs,
          label: `${timeFormatter.format(new Date(dayBarFromMs))}\u2013${timeFormatter.format(new Date(dayBarToMs))}`,
        } satisfies DayChart,
        activeTotalSecs: totalActive,
        pauseTotalSecs: totalPause,
      };
    }, [
      fromDate,
      i18n.language,
      segmentsQuery.data,
      sessionsQuery.data,
      t,
      toDate,
    ]);

  const totalTrackedSecs = activeTotalSecs + pauseTotalSecs;

  const renderChart = () => {
    if (segmentsQuery.isPending || sessionsQuery.isPending) {
      return <Skeleton h="40px" borderRadius="lg" />;
    }

    if (segmentsQuery.isError || sessionsQuery.isError) {
      return (
        <Text textStyle="sm" color="fg.error">
          {t("widgets.activityAnalytics.error")}
        </Text>
      );
    }

    return (
      <Box>
        <Box>
          <ActivitySessionBar data={dayChart} t={t} />
        </Box>

        {sessions.length === 0 && (
          <Flex flexDirection="column" gap={1} mt={3}>
            {totalTrackedSecs === 0 && (
              <Text textStyle="sm" color="fg.muted">
                {t("widgets.activityAnalytics.empty")}
              </Text>
            )}
          </Flex>
        )}

        {sessions.length > 0 && (
          <Accordion.Root collapsible mt={3} defaultValue={["sessions"]}>
            <Accordion.Item value="sessions" border="none">
              <Accordion.ItemTrigger>
                <Flex
                  w="full"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                  py={2}
                >
                  <Flex alignItems="center" gap={1} flexShrink={0}>
                    <Text textStyle="sm" fontWeight="bold" color="fg.muted">
                      {t("widgets.activityAnalytics.sessionsForDay")}
                    </Text>

                    <Badge size="xs">{sessions.length}</Badge>
                  </Flex>
                  <Flex alignItems="center" gap={1} flexShrink={0}>
                    <Accordion.ItemIndicator
                      color="fg.muted"
                      display="inline-flex"
                    >
                      <LuChevronDown size={18} />
                    </Accordion.ItemIndicator>
                  </Flex>
                </Flex>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Flex flexDirection="column" gap={3}>
                    {sessions.map((s) => (
                      <Box key={s.session.id}>
                        <ActivitySessionBar
                          data={s}
                          t={t}
                          rightSlot={
                            s.session.status === "active" ? null : (
                              <IconButton
                                variant="ghost"
                                size="xs"
                                aria-label={t(
                                  "widgets.activityAnalytics.deleteSession.ariaLabel",
                                )}
                                onClick={() => handleRequestDeleteSession(s)}
                              >
                                <TrashIcon size={16} />
                              </IconButton>
                            )
                          }
                        />
                      </Box>
                    ))}
                  </Flex>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        )}
      </Box>
    );
  };

  const handleChangeSelectedDate = useCallback(
    (date: Date | null) => {
      if (date) {
        setSelectedDate(date);
        navigate({
          to: "/activities/$activityId",
          params: { activityId },
          search: (prev) => ({ ...prev, date: getCalendarDay(date) }),
          replace: true,
        });
        setIsCalendarOpen(false);
      }
    },
    [activityId, navigate],
  );

  return (
    <Box display="flex" flexDirection="column" gap={3} px={1} pt={2}>
      <Flex gap={1} alignItems="center" flexWrap="wrap">
        <Text textStyle="sm" fontWeight="bold" color="fg.muted">
          {t("widgets.activityAnalytics.title")}
        </Text>

        <Popover.Root
          open={isCalendarOpen}
          onOpenChange={(details) => setIsCalendarOpen(details.open)}
          positioning={{ placement: "bottom-start" }}
        >
          <Popover.Trigger asChild>
            <Button variant="subtle" size="xs" height="auto" px={1}>
              <Text textStyle="sm">{dateLabel}</Text>
            </Button>
          </Popover.Trigger>
          <Popover.Positioner style={{ zIndex: 2 }}>
            <Popover.Content p={0} bg="transparent" border="none" w="auto">
              <Calendar
                selectedDate={selectedDate}
                onChangeSelectedDate={handleChangeSelectedDate}
              />
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>
      </Flex>

      <Flex justifyContent="space-between" gap={4}>
        <Text textStyle="sm" color="fg.muted">
          {t("widgets.activityAnalytics.totalTime")}
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

      {sessionToDelete && (
        <DeleteSessionDialog
          dialog={deleteDialog}
          sessionLabel={sessionToDelete.label}
          sessionDurationLabel={sessionToDelete.durationLabel}
          isDeleting={isDeletingSession}
          onConfirm={handleConfirmDeleteSession}
        />
      )}
    </Box>
  );
};
