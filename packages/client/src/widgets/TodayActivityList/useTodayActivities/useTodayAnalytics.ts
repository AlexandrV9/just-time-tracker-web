import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";

type UseTodayAnalyticsProps = {
  activityIds: string[];
  fromDate: string;
  toDate: string;
};

export function useTodayAnalytics({
  activityIds,
  fromDate,
  toDate,
}: UseTodayAnalyticsProps) {
  const normalizedActivityIds = [...new Set(activityIds)].sort();

  const query = useQuery({
    queryKey: [
      ACTIVITIES_ANALYTICS_QUERY_KEY,
      fromDate,
      toDate,
      normalizedActivityIds,
    ],
    queryFn: async () => {
      const response = await activityApiService.getActivitiesAnalytics({
        activityIds: normalizedActivityIds,
        fromDate,
        toDate,
      });

      if (!response.success) {
        return {
          totalSeconds: 0,
          itemsMap: {},
        };
      }

      const itemsMap: Record<string, number> = {};

      let totalSeconds = 0;

      for (const [id, item] of Object.entries(response.data.items)) {
        itemsMap[id] = item.activeDurationMs;
        totalSeconds += Math.floor(item.activeDurationMs / 1000);
      }

      return {
        totalSeconds,
        itemsMap,
      };
    },
    enabled: normalizedActivityIds.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    analytics: query.data ?? {
      totalSeconds: 0,
      itemsMap: {},
    },
    isSuccess: query.isSuccess,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
