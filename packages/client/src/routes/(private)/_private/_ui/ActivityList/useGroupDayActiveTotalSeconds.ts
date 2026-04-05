import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ActivityDTO } from "@to-do-list/shared";

import {
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";

import {
  getLocalDayBoundsIso,
  resolveDisplayedSeconds,
} from "./ActivityCard/utils";
import { useTickingNow } from "./ActivityCard/useTickingNow";

/**
 * Same basis as {@link useActivityCardData}: per-day analytics + live drift for active sessions.
 */
export function useGroupDayActiveTotalSeconds(
  dayKey: string,
  activities: ActivityDTO[],
): number {
  const { fromDate, toDate } = useMemo(
    () => getLocalDayBoundsIso(dayKey),
    [dayKey],
  );

  const analyticsResults = useQueries({
    queries: activities.map((activity) => ({
      queryKey: [ACTIVITY_ANALYTICS_QUERY_KEY, activity.id, fromDate, toDate],
      queryFn: () =>
        activityApiService.getActivityAnalytics({
          activityId: activity.id,
          fromDate,
          toDate,
        }),
      select: (response: Awaited<
        ReturnType<typeof activityApiService.getActivityAnalytics>
      >) => (response.success ? response.data : undefined),
    })),
  });

  const sessionResults = useQueries({
    queries: activities.map((activity) => ({
      queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, activity.currentSessionId],
      queryFn: () =>
        activityApiService.getActivitySession({
          id: activity.currentSessionId!,
        }),
      enabled: Boolean(activity.currentSessionId),
      select: (response: Awaited<
        ReturnType<typeof activityApiService.getActivitySession>
      >) => (response.success ? response.data : undefined),
    })),
  });

  const anyLiveActive = sessionResults.some((r) => r.data?.status === "active");
  const nowMs = useTickingNow(anyLiveActive);

  let totalSeconds = 0;
  for (let i = 0; i < activities.length; i++) {
    const dayActiveMs = analyticsResults[i]?.data?.totals.activeDurationMs ?? 0;
    const dataUpdatedAt = analyticsResults[i]?.dataUpdatedAt ?? 0;
    const session = sessionResults[i]?.data;
    const isLiveActiveTicking = session?.status === "active";
    totalSeconds += resolveDisplayedSeconds({
      dayActiveMs,
      analyticsFetchedAtMs: dataUpdatedAt,
      isLiveActiveTicking,
      nowMs,
    });
  }

  return totalSeconds;
}
