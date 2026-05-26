import { useDialog } from "@ark-ui/react";
import { Button, Popover } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { isValid, parseISO } from "date-fns";

import {
  ACTIVITY_SESSIONS_QUERY_KEY,
  ACTIVITY_SESSION_SEGMENTS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { Box, Calendar, Flex, Text, toast } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  getCalendarDay,
  getDateIntervalByCalendarDay,
} from "~/shared/libs";

import { ActivitySessionBars } from "./ActivitySessionBars";
import { DeleteSessionDialog } from "./DeleteSessionDialog";
import {
  useActivityDayCharts,
  type SessionChart,
} from "./useActivityDayCharts";

const formatDuration = (seconds: number) =>
  convertTimeObjectToTimeString(convertSecondsToTimeObject(seconds));

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

  const [selectedSession, setSelectedSession] = useState<{
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
      setSelectedSession({
        id: s.session.id,
        label: s.label,
        durationLabel: formatDuration(s.activeSecs + s.pauseSecs),
      });
      deleteDialog.setOpen(true);
    },
    [deleteDialog],
  );

  const handleConfirmDeleteSession = useCallback(() => {
    if (!selectedSession) return;
    deleteSession(selectedSession.id);
    setSelectedSession(null);
  }, [deleteSession, selectedSession]);

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
    useActivityDayCharts({
      fromDate,
      toDate,
      segments: segmentsQuery.data,
      sessions: sessionsQuery.data,
    });

  const totalTrackedSecs = activeTotalSecs + pauseTotalSecs;

  const chartLoading = segmentsQuery.isPending || sessionsQuery.isPending;
  const chartError = segmentsQuery.isError || sessionsQuery.isError;

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
    <Box display="flex" flexDirection="column" gap={3} pt={2}>
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
            <Button variant="subtle" size="xs" height="auto">
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

      <ActivitySessionBars
        isLoading={chartLoading}
        isError={chartError}
        dayChart={dayChart}
        sessions={sessions}
        totalTrackedSecs={totalTrackedSecs}
        onRequestDeleteSession={handleRequestDeleteSession}
      />

      {selectedSession && (
        <DeleteSessionDialog
          dialog={deleteDialog}
          sessionLabel={selectedSession.label}
          sessionDurationLabel={selectedSession.durationLabel}
          isDeleting={isDeletingSession}
          onConfirm={handleConfirmDeleteSession}
        />
      )}
    </Box>
  );
};
