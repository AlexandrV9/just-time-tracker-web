import { useQuery } from "@tanstack/react-query";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";

type UseTodayPlanActivitiesProps = {
  activityIds: string[];
};

export function useTodayPlanActivities({
  activityIds,
}: UseTodayPlanActivitiesProps) {
  const normalizedActivityIds = [...new Set(activityIds)].sort();

  const query = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, normalizedActivityIds],
    queryFn: () =>
      activityApiService.getActivitiesByIds({
        activityIds: normalizedActivityIds,
      }),
    enabled: normalizedActivityIds.length > 0,
    select: (response) => (response.success ? response.data : []),
  });

  return {
    todayPlanActivities: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
