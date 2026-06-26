import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";
import { ACTIVITIES_CURRENT_QUERY_KEY } from "~/shared/api/services";

import { useAuthStore } from "../../auth/useAuthStore";
import { useShallow } from "zustand/react/shallow";
import { useCurrentActivityStore } from "./useCurrentActivityStore";
import { fetchCurrentActivityData, mergeCurrentActivityFromServer } from "./utils";

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
  };
}
