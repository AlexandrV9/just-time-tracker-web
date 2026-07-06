import type { QueryClient } from "@tanstack/react-query";
import type { FileRouteTypes } from "~/routeTree.gen";
import {
  ACTIVITIES_ANALYTICS_QUERY_KEY,
  ACTIVITIES_CURRENT_QUERY_KEY,
  ACTIVITIES_QUERY_KEY,
  ACTIVITIES_TRACKED_QUERY_KEY,
  activityApiService,
  AUTH_PROVIDERS_QUERY_KEY,
  DAY_PLAN_ITEMS_QUERY_KEY,
  DAY_PLANS_QUERY_KEY,
  dayPlanApiService,
  userApiService,
} from "~/shared/api/services";
import { queryClient } from "~/shared/config";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";
import {
  ACTIVITY_HISTORY_GROUPS_LIMIT,
  ACTIVITY_HISTORY_GROUP_ITEMS_LIMIT,
  ACTIVITY_HISTORY_QUERY_KEY,
} from "~/widgets/ActivityHistory/constants";

const NAV_TAB_ROUTES = [
  "/history",
  "/activities",
  "/settings",
] as const satisfies readonly FileRouteTypes["to"][];

const SETTINGS_SUB_ROUTES = [
  "/settings/profile",
  "/settings/notifications",
  "/settings/pwa-install",
  "/settings/security",
] as const satisfies readonly FileRouteTypes["to"][];

export type NavTab = "home" | "history" | "activities" | "settings" | "other";

export const getNavTabFromPath = (pathname: string): NavTab => {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/history")) return "history";
  if (pathname.startsWith("/activities")) return "activities";
  if (pathname.startsWith("/settings")) return "settings";
  return "other";
};

const prefetchTodayAnalytics = async (
  client: QueryClient,
  activityIds: string[],
  fromDate: string,
  toDate: string,
) => {
  const normalizedActivityIds = [...new Set(activityIds)].sort();
  if (normalizedActivityIds.length === 0) return;

  await client.ensureQueryData({
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
        return { totalSeconds: 0, itemsMap: {} };
      }

      const itemsMap: Record<string, number> = {};
      let totalSeconds = 0;

      for (const [id, item] of Object.entries(response.data.items)) {
        itemsMap[id] = item.activeDurationMs;
        totalSeconds += Math.floor(item.activeDurationMs / 1000);
      }

      return { totalSeconds, itemsMap };
    },
  });
};

export const prefetchTodayTabData = async (
  userId: string,
  client: QueryClient = queryClient,
) => {
  const todayCalendarDay = getCalendarDay();
  const { fromDate, toDate } = getDateIntervalByCalendarDay(todayCalendarDay);

  const [currentResponse, trackedResponse, dayPlanResponse] = await Promise.all(
    [
      client.ensureQueryData({
        queryKey: [
          ACTIVITIES_CURRENT_QUERY_KEY,
          "today",
          userId,
          fromDate,
          toDate,
        ],
        queryFn: () =>
          activityApiService.getCurrentActivities({
            fromDate,
            toDate,
            limit: 100,
            page: 0,
          }),
      }),
      client.ensureQueryData({
        queryKey: [
          ACTIVITIES_TRACKED_QUERY_KEY,
          "today",
          userId,
          fromDate,
          toDate,
        ],
        queryFn: () =>
          activityApiService.getTrackedActivities({
            fromDate,
            toDate,
            limit: 100,
            page: 0,
          }),
      }),
      client.ensureQueryData({
        queryKey: [DAY_PLANS_QUERY_KEY, userId, todayCalendarDay],
        queryFn: () =>
          dayPlanApiService.getDayPlans({
            date: todayCalendarDay,
            page: 0,
            limit: 1,
          }),
      }),
    ],
  );

  const todayPlanId = dayPlanResponse.success
    ? dayPlanResponse.data.data[0]?.id
    : undefined;

  let todayPlanItemIds: string[] = [];

  if (todayPlanId) {
    const planItemsResponse = await client.ensureQueryData({
      queryKey: [DAY_PLAN_ITEMS_QUERY_KEY, todayPlanId],
      queryFn: () =>
        dayPlanApiService.getDayPlanItems({
          dayPlanId: todayPlanId,
          page: 0,
          limit: 100,
        }),
    });

    todayPlanItemIds = planItemsResponse.success
      ? planItemsResponse.data.data.map((item) => item.activityId)
      : [];
  }

  const normalizedPlanItemIds = [...new Set(todayPlanItemIds)].sort();

  if (normalizedPlanItemIds.length > 0) {
    await client.ensureQueryData({
      queryKey: [ACTIVITIES_QUERY_KEY, normalizedPlanItemIds],
      queryFn: () =>
        activityApiService.getActivitiesByIds({
          activityIds: normalizedPlanItemIds,
        }),
    });
  }

  const currentActivityIds = currentResponse.success
    ? currentResponse.data.data.map((item) => item.activity.id)
    : [];
  const trackedActivityIds = trackedResponse.success
    ? trackedResponse.data.data.map((item) => item.activity.id)
    : [];

  const analyticsActivityIds = [
    ...new Set([
      ...todayPlanItemIds,
      ...currentActivityIds,
      ...trackedActivityIds,
    ]),
  ];

  await prefetchTodayAnalytics(client, analyticsActivityIds, fromDate, toDate);
};

export const prefetchHistoryTabData = async (
  userId: string,
  client: QueryClient = queryClient,
) => {
  await client.ensureInfiniteQueryData({
    queryKey: [ACTIVITY_HISTORY_QUERY_KEY, userId],
    queryFn: ({ pageParam }) =>
      activityApiService.getGroupedActivities({
        groupBy: "day",
        groupLimit: ACTIVITY_HISTORY_GROUPS_LIMIT,
        itemsLimit: ACTIVITY_HISTORY_GROUP_ITEMS_LIMIT,
        groupCursor: pageParam ?? undefined,
      }),
    initialPageParam: null as string | null,
  });
};

export const prefetchActivitiesTabData = async (
  _userId: string,
  client: QueryClient = queryClient,
) => {
  await client.ensureInfiniteQueryData({
    queryKey: [ACTIVITIES_QUERY_KEY],
    queryFn: (ctx) =>
      activityApiService.getActivities({
        page: ctx.pageParam,
        limit: 20,
      }),
    initialPageParam: 0,
  });
};

export const prefetchSettingsTabData = async (
  _userId: string,
  client: QueryClient = queryClient,
) => {
  await client.ensureQueryData({
    queryKey: [AUTH_PROVIDERS_QUERY_KEY],
    queryFn: () => userApiService.getAuthProviders(),
  });
};

const TAB_PREFETCHERS: Record<
  Exclude<NavTab, "other">,
  (userId: string, client: QueryClient) => Promise<void>
> = {
  home: prefetchTodayTabData,
  history: prefetchHistoryTabData,
  activities: prefetchActivitiesTabData,
  settings: prefetchSettingsTabData,
};

let backgroundTabsPrefetchStarted = false;

export const prefetchNavTabForPath = async (
  pathname: string,
  userId: string,
  client: QueryClient = queryClient,
) => {
  const currentTab = getNavTabFromPath(pathname);
  const currentPrefetcher =
    currentTab === "other" ? null : TAB_PREFETCHERS[currentTab];

  if (currentPrefetcher) {
    await currentPrefetcher(userId, client);
  }

  if (backgroundTabsPrefetchStarted) {
    return;
  }

  backgroundTabsPrefetchStarted = true;

  const backgroundPrefetches = (
    Object.entries(TAB_PREFETCHERS) as Array<
      [
        Exclude<NavTab, "other">,
        (userId: string, client: QueryClient) => Promise<void>,
      ]
    >
  )
    .filter(([tab]) => tab !== currentTab)
    .map(([, prefetcher]) => prefetcher(userId, client));

  void Promise.allSettled(backgroundPrefetches);
};

export const preloadNavRouteChunks = (
  preloadRoute: (opts: { to: FileRouteTypes["to"] }) => Promise<unknown>,
) => {
  [...NAV_TAB_ROUTES, ...SETTINGS_SUB_ROUTES].forEach((to) => {
    void preloadRoute({ to });
  });
};
