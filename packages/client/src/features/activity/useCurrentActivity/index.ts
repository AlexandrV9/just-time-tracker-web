import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ActivityStatusDTO } from "@time-tracker/shared";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";
import { ACTIVITIES_CURRENT_QUERY_KEY } from "~/shared/api/services";

import { useAuthStore } from "../../auth/useAuthStore";
import { useShallow } from "zustand/react/shallow";
import { useCurrentActivityStore } from "./useCurrentActivityStore";
import { fetchCurrentActivityData, mergeCurrentActivityFromServer } from "./utils";
import { useDisplayedSessionSeconds } from "../useDisplayedSessionSeconds";
import {
  useFinishActivity,
  usePauseActivity,
  useStartActivity,
} from "../mutations";

export function useCurrentActivity() {
  const userId = useAuthStore((state) => state.user?.id);

  const {
    updateData,
    currentActivity,
    currentSession,
    currentSegment,
    setCurrentActivity,
    setCurrentSession,
    setCurrentSegment,
  } = useCurrentActivityStore(
    useShallow((state) => ({
      updateData: state.updateData,
      currentActivity: state.currentActivity,
      setCurrentActivity: state.setCurrentActivity,
      currentSession: state.currentSession,
      setCurrentSession: state.setCurrentSession,
      currentSegment: state.currentSegment,
      setCurrentSegment: state.setCurrentSegment,
    })),
  );

  const calendarDay = getCalendarDay();
  const { fromDate, toDate } = getDateIntervalByCalendarDay(calendarDay);

  // Один общий ключ → react-query делает дедупликацию всех маунтов этого хука в один запрос
  // (а инвалидация ACTIVITIES_CURRENT_QUERY_KEY в мутациях обновляет и его).
  const query = useQuery({
    queryKey: [ACTIVITIES_CURRENT_QUERY_KEY, "stopwatch", userId, fromDate, toDate],
    queryFn: () => fetchCurrentActivityData({ fromDate, toDate }),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!query.data) return;

    updateData((prev) => {
      const merged = mergeCurrentActivityFromServer(
        {
          activity: prev.currentActivity ?? null,
          session: prev.currentSession ?? null,
          segment: prev.currentSegment ?? null,
        },
        query.data,
      );

      return {
        currentActivity: merged.activity,
        currentSession: merged.session,
        currentSegment: merged.segment,
      };
    });
  }, [query.data, updateData]);

  const status: ActivityStatusDTO = useMemo(() => {
    const sessionStatus = currentSession?.status;
    if (sessionStatus === "active" || sessionStatus === "paused") {
      return sessionStatus;
    }

    return currentActivity?.status ?? "idle";
  }, [currentSession?.status, currentActivity?.status]);

  const displayedSeconds = useDisplayedSessionSeconds({
    session: currentSession,
    segment: currentSegment,
  });

  const { mutateAsync: startActivity } = useStartActivity();
  const { mutateAsync: pauseActivity } = usePauseActivity();
  const { mutateAsync: finishActivity } = useFinishActivity();

  const start = useCallback(async () => {
    if (!currentActivity || status === "active") return;

    return startActivity({
      activityId: currentActivity.id,
      startedAt: new Date().toISOString(),
      activeDurationMs: currentActivity.activeDurationMs,
    });
  }, [currentActivity, status, startActivity]);

  const pause = useCallback(async () => {
    if (!currentActivity || status !== "active") return;

    return pauseActivity({
      activity: currentActivity,
      session: currentSession,
      segment: currentSegment,
      pausedAt: new Date().toISOString(),
    });
  }, [currentActivity, currentSession, currentSegment, status, pauseActivity]);

  const finish = useCallback(async () => {
    if (!currentActivity || status === "idle") return;

    return finishActivity({
      activity: currentActivity,
      session: currentSession,
      segment: currentSegment,
      finishedAt: new Date().toISOString(),
    });
  }, [currentActivity, currentSession, currentSegment, status, finishActivity]);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    updateData,
    currentActivity,
    setCurrentActivity,
    currentSession,
    setCurrentSession,
    currentSegment,
    setCurrentSegment,
    status,
    displayedSeconds,
    start,
    pause,
    finish,
  };
}
