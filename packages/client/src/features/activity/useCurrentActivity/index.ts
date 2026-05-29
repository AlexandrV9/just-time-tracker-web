import { useEffect, useState } from "react";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";

import { useAuthStore } from "../../auth/useAuthStore";
import { useShallow } from "zustand/react/shallow";
import { useCurrentActivityStore } from "./useCurrentActivityStore";
import { fetchCurrentActivityData } from "./utils";

export function useCurrentActivity() {
  const { user } = useAuthStore();
  const userId = user?.id;

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

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const calendarDay = getCalendarDay();
  const { fromDate, toDate } = getDateIntervalByCalendarDay(calendarDay);

  useEffect(() => {
    if (!userId) return;

    setIsError(false);
    setIsLoading(true);

    fetchCurrentActivityData({
      fromDate,
      toDate,
    })
      .then((result) => {
        updateData({
          currentActivity: result.activity,
          currentSession: result.session,
          currentSegment: result.segment,
        });
      })
      .catch((error) => {
        setIsError(true);
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fromDate, toDate, userId, updateData]);

  return {
    isLoading,
    isError,
    updateData,
    currentActivity,
    setCurrentActivity,
    currentSession,
    setCurrentSession,
    currentSegment,
    setCurrentSegment,
  };
}
