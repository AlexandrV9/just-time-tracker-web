import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { activityApiService } from "~/shared/api/services";

export type FetchCurrentActivityDataParams = {
  createdById: string;
  fromDate: string;
  toDate: string;
};

export type FetchCurrentActivityDataResult = {
  activity: ActivityDTO | null;
  session: ActivitySessionDTO | null;
  segment: ActivitySessionSegmentDTO | null;
};

export async function fetchCurrentActivityData({
  createdById,
  fromDate,
  toDate,
}: FetchCurrentActivityDataParams): Promise<FetchCurrentActivityDataResult> {
  const activityResponse = await activityApiService.getCurrentActivities({
    createdById,
    status: "active",
    fromDate,
    toDate,
    page: 0,
    limit: 1,
  });

  if (!activityResponse.success) {
    throw new Error(
      activityResponse.message ?? "Failed to get current activity",
    );
  }

  const activity =
    activityResponse.data?.data?.find((row) => row.activity.status === "active")
      ?.activity ?? null;

  if (!activity?.currentSessionId) {
    return { activity, session: null, segment: null };
  }

  const activityAnalyticsResponse =
    await activityApiService.getActivityAnalytics({
      activityId: activity!.id,
      fromDate,
      toDate,
    });

  if (!activityAnalyticsResponse.success) {
    throw new Error(
      activityAnalyticsResponse.message ??
        "Failed to get current activity analytics",
    );
  }

  const activityAnalytics = activityAnalyticsResponse.data;

  const sessionResponse = await activityApiService.getActivitySession({
    id: activity.currentSessionId,
  });

  if (!sessionResponse.success) {
    throw new Error(sessionResponse.message ?? "Failed to get current session");
  }

  const session = sessionResponse.data;

  if (!session?.currentSegmentId) {
    return { activity, session, segment: null };
  }

  const segmentResponse = await activityApiService.getSessionSegment({
    segmentId: session.currentSegmentId,
  });

  if (!segmentResponse.success) {
    throw new Error(segmentResponse.message ?? "Failed to get current segment");
  }

  const segment = segmentResponse.data;

  return {
    activity: {
      ...activity,
      activeDurationMs: activityAnalytics.activeDurationMs ?? 0,
      pauseDurationMs: activityAnalytics.pauseDurationMs ?? 0,
    },
    session,
    segment,
  };
}
