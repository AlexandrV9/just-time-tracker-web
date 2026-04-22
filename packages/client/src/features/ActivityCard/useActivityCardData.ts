import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivityStatusDTO,
} from "@to-do-list/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  ACTIVITY_SESSIONS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";

import { formatDurationLabel, resolveHasActiveSession } from "./utils";
import { useDisplayedSeconds } from "./useDisplayedSeconds";
import type { PreloadedAnalytics } from "./index";

type UseActivityCardDataProps = {
  activityId: ActivityDTO["id"];
  currentSessionId?: ActivitySessionDTO["id"] | null;
  activityStatus: ActivityStatusDTO;
  preloadedAnalytics: PreloadedAnalytics;
};

export function useActivityCardData({
  currentSessionId,
  activityStatus,
  preloadedAnalytics,
}: UseActivityCardDataProps) {
  const { data: currentSession, isLoading: isLoadingCurrentSession } = useQuery(
    {
      queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, currentSessionId],
      enabled: Boolean(currentSessionId) && activityStatus === "active",
      queryFn: async () => {
        if (!currentSessionId) return undefined;

        const response = await activityApiService.getActivitySession({
          id: currentSessionId,
        });

        return response.success ? response.data : undefined;
      },
    },
  );

  const sessionQueryEnabled =
    Boolean(currentSessionId) && activityStatus === "active";

  const effectiveSessionStatus = sessionQueryEnabled
    ? currentSession?.status
    : activityStatus === "paused"
      ? "paused"
      : undefined;

  const hasActiveSession = resolveHasActiveSession({
    activityStatus,
    currentSessionStatus: currentSession?.status,
  });

  const displayedSeconds = useDisplayedSeconds({
    currentActiveMs: preloadedAnalytics.currentActiveMs,
    analyticsFetchedAtMs: preloadedAnalytics.fetchedAtMs,
    hasActiveSession,
  });

  const displayedTime = useMemo(
    () => formatDurationLabel(displayedSeconds),
    [displayedSeconds],
  );

  return {
    displayedTime,
    sessionStatus: effectiveSessionStatus,
    hasActiveSession,
    isLoading: isLoadingCurrentSession,
  };
}
