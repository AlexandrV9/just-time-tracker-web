import type { QueryClient } from "@tanstack/react-query";
import type { ActivityTrackingEventTypeDTO } from "@to-do-list/shared";
import {
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  ACTIVITIES_CURRENT_QUERY_KEY,
  ACTIVITIES_QUERY_KEY,
  ACTIVITIES_TRACKED_QUERY_KEY,
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
} from "~/shared/api/services";

const invalidateActivityQueryKeys = [
  ACTIVITIES_QUERY_KEY,
  ACTIVITIES_CURRENT_QUERY_KEY,
  ACTIVITY_SESSIONS_QUERY_KEY,
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  ACTIVITY_ANALYTICS_QUERY_KEY,
  ACTIVITIES_TRACKED_QUERY_KEY,
];

export function invalidateActivityTrackingQueries(
  queryClient: QueryClient,
  type: ActivityTrackingEventTypeDTO,
) {
  queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
  queryClient.invalidateQueries({
    queryKey: [ACTIVITIES_CURRENT_QUERY_KEY],
  });
  queryClient.invalidateQueries({
    queryKey: [ACTIVITY_SESSIONS_QUERY_KEY],
  });
  queryClient.invalidateQueries({
    queryKey: [ACTIVITIES_ANALYTICS_QUERY_KEY],
  });

  if (type === "paused" || type === "finished") {
    queryClient.invalidateQueries({
      queryKey: [ACTIVITY_ANALYTICS_QUERY_KEY],
    });
  }

  if (type === "finished") {
    queryClient.invalidateQueries({
      queryKey: [ACTIVITIES_TRACKED_QUERY_KEY],
    });
  }
}

export function invalidateAllActivityTrackingQueries(queryClient: QueryClient) {
  for (const key of invalidateActivityQueryKeys) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
}
