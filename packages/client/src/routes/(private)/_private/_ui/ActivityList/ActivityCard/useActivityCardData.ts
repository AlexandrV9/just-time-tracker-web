import type { ActivityDTO } from "@to-do-list/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";

import {
  formatDurationLabel,
  getLocalDayBoundsIso,
  resolveDisplayedSeconds,
} from "./utils";
import { useTickingNow } from "./useTickingNow";

type UseActivityCardDataArgs = {
  activityId?: ActivityDTO["id"];
  activityCurrentSessionId?: ActivityDTO["currentSessionId"];
  dayKey: string;
};

export function useActivityCardData({
  activityId,
  activityCurrentSessionId,
  dayKey,
}: UseActivityCardDataArgs) {
  const { fromDate, toDate } = useMemo(
    () => getLocalDayBoundsIso(dayKey),
    [dayKey],
  );

  const { data: session } = useQuery({
    queryKey: [ACTIVITY_SESSIONS_QUERY_KEY, activityCurrentSessionId],
    queryFn: () =>
      activityApiService.getActivitySession({
        id: activityCurrentSessionId!,
      }),
    enabled: Boolean(activityCurrentSessionId),
    select: (response) => (response.success ? response.data : undefined),
  });

  const { data: analytics, dataUpdatedAt } = useQuery({
    queryKey: [ACTIVITY_ANALYTICS_QUERY_KEY, activityId, fromDate, toDate],
    queryFn: () =>
      activityApiService.getActivityAnalytics({
        activityId: activityId!,
        fromDate,
        toDate,
      }),
    enabled: !!activityId,
    select: (response) => (response.success ? response.data : undefined),
  });

  const dayActiveMs = analytics?.totals.activeDurationMs ?? 0;

  /** Session status is authoritative; `currentSegmentId` is not loaded from DB yet. */
  const isLiveActiveTicking = session?.status === "active";

  const nowMs = useTickingNow(isLiveActiveTicking);

  const displayedSeconds = useMemo(
    () =>
      resolveDisplayedSeconds({
        dayActiveMs,
        analyticsFetchedAtMs: dataUpdatedAt,
        isLiveActiveTicking,
        nowMs,
      }),
    [
      dayActiveMs,
      dataUpdatedAt,
      isLiveActiveTicking,
      nowMs,
    ],
  );

  const displayedTime = formatDurationLabel(displayedSeconds);

  return { displayedTime, session };
}
