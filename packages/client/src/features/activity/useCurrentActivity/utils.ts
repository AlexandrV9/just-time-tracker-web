import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { activityApiService } from "~/shared/api/services";

export type FetchCurrentActivityDataParams = {
  fromDate: string;
  toDate: string;
};

export type FetchCurrentActivityDataResult = {
  activity: ActivityDTO | null;
  session: ActivitySessionDTO | null;
  segment: ActivitySessionSegmentDTO | null;
};

export async function fetchCurrentActivityData({
  fromDate,
  toDate,
}: FetchCurrentActivityDataParams): Promise<FetchCurrentActivityDataResult> {
  const activityResponse = await activityApiService.getCurrentActivities({
    fromDate,
    toDate,
    page: 0,
    limit: 25,
  });

  if (!activityResponse.success) {
    throw new Error(
      activityResponse.message ?? "Failed to get current activity",
    );
  }

  const rows = activityResponse.data?.data ?? [];
  const chosen =
    rows.find((row) => row.activity.status === "active") ??
    rows.find((row) => row.activity.status === "paused") ??
    null;

  if (!chosen?.activity?.currentSessionId || !chosen.session) {
    return { activity: null, session: null, segment: null };
  }

  const { activity, session } = chosen;

  const activityAnalyticsResponse =
    await activityApiService.getActivityAnalytics({
      activityId: activity.id,
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

  if (!session.currentSegmentId) {
    return {
      activity: {
        ...activity,
        activeDurationMs: activityAnalytics.activeDurationMs ?? 0,
        pauseDurationMs: activityAnalytics.pauseDurationMs ?? 0,
      },
      session,
      segment: null,
    };
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
