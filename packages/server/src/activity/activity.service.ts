import type {
  CreateActivityDataDTO,
  UpdateActivityDataDTO,
  GetActivitiesDTO,
  ActivityDTO,
  GetActivityDTO,
  GetActivitiesResponseDTO,
  GetActivitySessionsDTO,
  GetActivitySessionsResponseDTO,
  ActivitySessionDTO,
  GetActivityAnalyticsDTO,
  GetActivityAnalyticsResponseDTO,
} from "@to-do-list/shared";

import {
  activityRepository,
  mapActivityRowToDTO,
} from "./activity.repository.js";
import { activityQueries } from "./activity.queries.js";
import {
  finishActivitySession,
  pauseActivitySession,
  startActivitySession,
} from "./activitySession.tracking.service.js";
import { activitySessionQueries } from "./activitySession.queries.js";
import { activitySessionSegmentQueries } from "./activitySessionSegment.queries.js";
import type { ErrorResponse, SuccessResponse } from "src/shared/types.js";

type DayTotalsAgg = {
  activeDurationMs: number;
  pauseDurationMs: number;
};

function clipSegmentToWindow(
  startedAtIso: string,
  endedAtIso: string | null,
  windowFromMs: number,
  windowToMs: number,
): { start: number; end: number } | null {
  const startMs = Date.parse(startedAtIso);
  const naturalEndMs = endedAtIso ? Date.parse(endedAtIso) : Date.now();
  if (!Number.isFinite(startMs) || !Number.isFinite(naturalEndMs)) {
    return null;
  }

  const clipStart = Math.max(startMs, windowFromMs);
  const clipEnd = Math.min(naturalEndMs, windowToMs);
  if (clipEnd <= clipStart) {
    return null;
  }
  return { start: clipStart, end: clipEnd };
}

function utcDayStartMs(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function addMsToUtcDayBuckets(
  startMs: number,
  endMs: number,
  kind: "active" | "pause",
  buckets: Map<number, DayTotalsAgg>,
): void {
  let t = startMs;
  while (t < endMs) {
    const dayStart = utcDayStartMs(t);
    const dayEnd = dayStart + 86400000;
    const sliceEnd = Math.min(endMs, dayEnd);
    const dur = sliceEnd - t;

    let row = buckets.get(dayStart);
    if (!row) {
      row = { activeDurationMs: 0, pauseDurationMs: 0 };
      buckets.set(dayStart, row);
    }
    if (kind === "active") {
      row.activeDurationMs += dur;
    } else {
      row.pauseDurationMs += dur;
    }
    t = sliceEnd;
  }
}

type CreateActivityResponse = SuccessResponse<ActivityDTO> | ErrorResponse;

const createActivity = async (
  data: CreateActivityDataDTO,
): Promise<CreateActivityResponse> => {
  try {
    const entry = await activityRepository.createActivity(data);

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Create activity error:", error);

    return {
      success: false,
      message: "Failed to create activity",
    };
  }
};

type UpdateActivityResponse = SuccessResponse<ActivityDTO> | ErrorResponse;

const updateActivity = async (
  data: UpdateActivityDataDTO,
): Promise<UpdateActivityResponse> => {
  try {
    const entry = await activityRepository.updateActivity(data);

    if (!entry) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Update activity error:", error);

    return {
      success: false,
      message: "Failed to update activity",
    };
  }
};

type DeleteActivityResponse = SuccessResponse<null> | ErrorResponse;

const deleteActivity = async (data: {
  id: string;
}): Promise<DeleteActivityResponse> => {
  try {
    const activity = await activityRepository.getActivityById(data.id);

    if (!activity) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    await activityRepository.deleteActivity({ id: data.id });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Delete activity error:", error);

    return {
      success: false,
      message: "Failed to delete activity",
    };
  }
};

type GetActivityByIdResponse = SuccessResponse<ActivityDTO> | ErrorResponse;

const getActivityById = async (
  data: GetActivityDTO,
): Promise<GetActivityByIdResponse> => {
  try {
    const entry = await activityRepository.getActivityById(data.id);

    if (!entry) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Get activity error:", error);

    return {
      success: false,
      message: "Failed to get activity",
    };
  }
};

type GetActivitiesResponse =
  | SuccessResponse<GetActivitiesResponseDTO>
  | ErrorResponse;

const getActivities = async (
  filters: GetActivitiesDTO,
): Promise<GetActivitiesResponse> => {
  try {
    const result = await activityQueries.getActivities(filters);

    return {
      success: true,
      data: {
        ...result,
        data: result.data.map((row) =>
          mapActivityRowToDTO(row as Record<string, unknown>),
        ),
      },
    };
  } catch (error) {
    console.error("Get activities error:", error);

    return {
      success: false,
      message: "Failed to fetch activities",
    };
  }
};

type SessionTrackingResponse = Awaited<ReturnType<typeof startActivitySession>>;

const startActivity = async (
  data: GetActivityDTO,
): Promise<SessionTrackingResponse> => {
  return startActivitySession(data.id);
};

const pauseActivity = async (
  data: GetActivityDTO,
): Promise<SessionTrackingResponse> => {
  return pauseActivitySession(data.id);
};

const finishActivity = async (
  data: GetActivityDTO,
): Promise<SessionTrackingResponse> => {
  return finishActivitySession(data.id);
};

type GetActivitySessionsByActivityIdResponse =
  | SuccessResponse<GetActivitySessionsResponseDTO>
  | ErrorResponse;

const getSessionsByActivityId = async (
  data: GetActivitySessionsDTO,
): Promise<GetActivitySessionsByActivityIdResponse> => {
  try {
    const activity = await activityRepository.getActivityById(data.activityId);

    if (!activity) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    const sessions: ActivitySessionDTO[] =
      await activitySessionQueries.getActivitySessionsByActivityId(
        data.activityId,
        data.fromDate ?? null,
        data.toDate ?? null,
      );

    return {
      success: true,
      data: { sessions },
    };
  } catch (error) {
    console.error("List activity sessions error:", error);

    return {
      success: false,
      message: "Failed to fetch activity sessions",
    };
  }
};

type GetActivityAnalyticsResult =
  | SuccessResponse<GetActivityAnalyticsResponseDTO>
  | ErrorResponse;

const getActivityAnalytics = async (
  data: GetActivityAnalyticsDTO,
): Promise<GetActivityAnalyticsResult> => {
  try {
    const entry = await activityRepository.getActivityById(data.activityId);

    if (!entry) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    const nowIso = new Date().toISOString();
    const fromIso = data.fromDate ?? "1970-01-01T00:00:00.000Z";
    const toIso = data.toDate ?? nowIso;

    const fromMs = Date.parse(fromIso);
    const toMs = Date.parse(toIso);
    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs <= fromMs) {
      return {
        success: false,
        message: "Invalid date range (toDate must be after fromDate)",
      };
    }

    const segments =
      await activitySessionSegmentQueries.listSegmentIntervalsForActivityInRange(
        data.activityId,
        fromIso,
        toIso,
      );

    let activeDurationMs = 0;
    let pauseDurationMs = 0;
    const dayBuckets = new Map<number, DayTotalsAgg>();

    for (const seg of segments) {
      const clip = clipSegmentToWindow(
        seg.startedAt,
        seg.endedAt,
        fromMs,
        toMs,
      );
      if (!clip) {
        continue;
      }

      const ms = clip.end - clip.start;
      if (seg.type === "active") {
        activeDurationMs += ms;
      } else {
        pauseDurationMs += ms;
      }
      addMsToUtcDayBuckets(clip.start, clip.end, seg.type, dayBuckets);
    }

    const floorMs = (n: number) => Math.floor(Math.max(0, n));

    const days = Array.from(dayBuckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([utcDayStart, totals]) => ({
        day: new Date(utcDayStart).toISOString(),
        totals: {
          activeDurationMs: floorMs(totals.activeDurationMs),
          pauseDurationMs: floorMs(totals.pauseDurationMs),
          totalDurationMs: floorMs(
            totals.activeDurationMs + totals.pauseDurationMs,
          ),
        },
      }));

    return {
      success: true,
      data: {
        activityId: data.activityId,
        fromDate: fromIso,
        toDate: toIso,
        totals: {
          activeDurationMs: floorMs(activeDurationMs),
          pauseDurationMs: floorMs(pauseDurationMs),
          totalDurationMs: floorMs(activeDurationMs + pauseDurationMs),
        },
        days,
      },
    };
  } catch (error) {
    console.error("Get activity analytics error:", error);

    return {
      success: false,
      message: "Failed to load activity analytics",
    };
  }
};

export const activitiesService = {
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityById,
  getActivities,
  startActivity,
  pauseActivity,
  finishActivity,
  getSessionsByActivityId,
  getActivityAnalytics,
};
