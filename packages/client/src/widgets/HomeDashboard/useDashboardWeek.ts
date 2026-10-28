import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import {
  activityApiService,
  ACTIVITIES_ANALYTICS_QUERY_KEY,
} from "~/shared/api/services";

const DAY_MS = 86_400_000;

export function useDashboardWeek() {
  const userId = useAuthStore((state) => state.user?.id);
  const now = new Date();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const from = today - DAY_MS * 6;
  const query = useQuery({
    queryKey: [ACTIVITIES_ANALYTICS_QUERY_KEY, "dashboard-week", userId, today],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await activityApiService.getGroupedActivities({
        groupBy: "day",
        groupLimit: 7,
        itemsLimit: 1,
        fromDate: new Date(from).toISOString(),
        toDate: new Date().toISOString(),
      });
      if (!response.success) throw new Error(response.message);
      return response.data.groups;
    },
    refetchInterval: 60_000,
  });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(from + DAY_MS * index);
    const group = query.data?.find(
      (item) =>
        item.groupDateStart.slice(0, 10) === date.toISOString().slice(0, 10),
    );
    return {
      date,
      activeSeconds: Math.floor((group?.totalActiveDurationMs ?? 0) / 1000),
    };
  });
  return { ...query, days };
}
