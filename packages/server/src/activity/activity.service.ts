import type {
  CreateActivityDataDTO,
  UpdateActivityDataDTO,
  GetActivitiesDTO,
  GetActivitiesByIdsDTO,
  ActivityDTO,
  GetActivityDTO,
  GetActivitiesResponseDTO,
  GetActivitySessionsDTO,
  GetActivitySessionsResponseDTO,
  ActivitySessionDTO,
  GetActivityAnalyticsDTO,
  GetActivityAnalyticsResponseDTO,
  CreateActivityFromQuickTimerDataDTO,
  GetGroupedActivitiesQueryDTO,
  GetGroupedActivitiesResponseDTO,
  GetActivitiesAnalyticsResponseDTO,
  GetActivitiesAnalyticsQueryDTO,
  GetActivitySessionSegmentsDTO,
  GetActivitySessionSegmentsResponseDTO,
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
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";

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

const createActivityFromQuickTimer = async (
  data: CreateActivityFromQuickTimerDataDTO,
): Promise<CreateActivityResponse> => {
  try {
    const entry = await activityRepository.createActivityFromQuickTimer(data);

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Create activity from quick timer error:", error);

    return {
      success: false,
      message: "Failed to create activity from quick timer",
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

type GetActivitiesByIdsResponse =
  | SuccessResponse<ActivityDTO[]>
  | ErrorResponse;

const getActivitiesByIds = async (
  data: GetActivitiesByIdsDTO,
): Promise<GetActivitiesByIdsResponse> => {
  try {
    const rows = await activityQueries.getActivitiesByIds(data);

    return {
      success: true,
      data: rows.map((row) =>
        mapActivityRowToDTO(row as Record<string, unknown>),
      ),
    };
  } catch (error) {
    console.error("Get activities by ids error:", error);

    return {
      success: false,
      message: "Failed to fetch activities",
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

type GetActivitySessionSegmentsByActivityIdResponse =
  | SuccessResponse<GetActivitySessionSegmentsResponseDTO>
  | ErrorResponse;

const getSessionSegmentsByActivityId = async (
  data: GetActivitySessionSegmentsDTO,
): Promise<GetActivitySessionSegmentsByActivityIdResponse> => {
  try {
    const activity = await activityRepository.getActivityById(data.activityId);

    if (!activity) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    const segments =
      await activitySessionSegmentQueries.listSegmentsForActivityInRange(
        data.activityId,
        data.fromDate ?? null,
        data.toDate ?? null,
      );

    return {
      success: true,
      data: { segments },
    };
  } catch (error) {
    console.error("List activity session segments error:", error);

    return {
      success: false,
      message: "Failed to fetch activity session segments",
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
        activeDurationMs: floorMs(totals.activeDurationMs),
        pauseDurationMs: floorMs(totals.pauseDurationMs),
      }));

    return {
      success: true,
      data: {
        activityId: data.activityId,
        activeDurationMs: floorMs(activeDurationMs),
        pauseDurationMs: floorMs(pauseDurationMs),
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

type GetActivitiesAnalyticsResult =
  | SuccessResponse<GetActivitiesAnalyticsResponseDTO>
  | ErrorResponse;

const getActivitiesAnalytics = async (
  data: GetActivitiesAnalyticsQueryDTO,
): Promise<GetActivitiesAnalyticsResult> => {
  try {
    const { activityIds, fromDate, toDate } = data;

    if (activityIds.length === 0) {
      return { success: true, data: { items: {} } };
    }

    const nowIso = new Date().toISOString();
    const fromIso = fromDate ?? "1970-01-01T00:00:00.000Z";
    const toIso = toDate ?? nowIso;

    const fromMs = Date.parse(fromIso);
    const toMs = Date.parse(toIso);
    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs <= fromMs) {
      return {
        success: false,
        message: "Invalid date range (toDate must be after fromDate)",
      };
    }

    const segments =
      await activitySessionSegmentQueries.listSegmentIntervalsForMultipleActivitiesInRange(
        activityIds,
        fromIso,
        toIso,
      );

    const floorMs = (n: number) => Math.floor(Math.max(0, n));

    const perActivity = new Map<
      string,
      {
        activeDurationMs: number;
        pauseDurationMs: number;
        dayBuckets: Map<number, DayTotalsAgg>;
      }
    >();

    for (const id of activityIds) {
      perActivity.set(id, {
        activeDurationMs: 0,
        pauseDurationMs: 0,
        dayBuckets: new Map(),
      });
    }

    for (const seg of segments) {
      const agg = perActivity.get(seg.activityId);
      if (!agg) continue;

      const clip = clipSegmentToWindow(
        seg.startedAt,
        seg.endedAt,
        fromMs,
        toMs,
      );
      if (!clip) continue;

      const ms = clip.end - clip.start;
      if (seg.type === "active") {
        agg.activeDurationMs += ms;
      } else {
        agg.pauseDurationMs += ms;
      }
      addMsToUtcDayBuckets(clip.start, clip.end, seg.type, agg.dayBuckets);
    }

    const items: GetActivitiesAnalyticsResponseDTO["items"] = {};

    for (const [activityId, agg] of perActivity) {
      const days = Array.from(agg.dayBuckets.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([utcDayStart, totals]) => ({
          day: new Date(utcDayStart).toISOString(),
          activeDurationMs: floorMs(totals.activeDurationMs),
          pauseDurationMs: floorMs(totals.pauseDurationMs),
        }));

      items[activityId] = {
        activityId,
        activeDurationMs: floorMs(agg.activeDurationMs),
        pauseDurationMs: floorMs(agg.pauseDurationMs),
        days,
      };
    }

    return { success: true, data: { items } };
  } catch (error) {
    console.error("Get batch activity analytics error:", error);
    return {
      success: false,
      message: "Failed to load batch activity analytics",
    };
  }
};

type CursorPayload = {
  groupBy: "day";
  groupStart: string;
  groupEnd: string;
  offsetInGroup: number;
  [key: string]: unknown;
};

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decodeCursor(cursor: string): CursorPayload | null {
  try {
    return JSON.parse(
      Buffer.from(cursor, "base64").toString("utf8"),
    ) as CursorPayload;
  } catch {
    return null;
  }
}

type GetGroupedActivitiesResult =
  | SuccessResponse<GetGroupedActivitiesResponseDTO>
  | ErrorResponse;

const getGroupedActivities = async (
  params: GetGroupedActivitiesQueryDTO,
): Promise<GetGroupedActivitiesResult> => {
  try {
    const { createdById, cursor, limit, fromDate, toDate, utcOffsetMinutes } =
      params;

    const fromDay = fromDate
      ? new Date(fromDate).toISOString().slice(0, 10)
      : undefined;

    const toDay = toDate
      ? new Date(toDate).toISOString().slice(0, 10)
      : undefined;

    let beforeDay: string | undefined;

    if (cursor) {
      const payload = decodeCursor(cursor);

      if (payload?.groupStart) {
        beforeDay = new Date(payload.groupStart).toISOString().slice(0, 10);
      }
    }

    // Fetch limit + 1 days to detect whether a next page exists.
    const { days: rawDays, activities: rawActivities } =
      await activityQueries.listActivitiesGroupedCursor({
        createdById,
        beforeDay,
        fromDay,
        toDay,
        limit: limit + 1,
        utcOffsetMinutes,
      });

    const hasNext = rawDays.length > limit;
    const days = hasNext ? rawDays.slice(0, limit) : rawDays;

    if (days.length === 0) {
      return {
        success: true,
        data: {
          groups: [],
          pagination: { nextCursor: null, hasNext: false },
        },
      };
    }

    // Filter activities to only those belonging to the returned days.
    const daySet = new Set(days);
    const activities = rawActivities.filter((r) =>
      daySet.has(String(r["calendarDay"])),
    );

    // Group activities by day.
    const activityMap = new Map<string, ActivityDTO[]>();
    for (const day of days) {
      activityMap.set(day, []);
    }
    for (const row of activities) {
      const day = String(row["calendarDay"]);
      const { calendarDay: _cd, ...rest } = row as Record<string, unknown> & {
        calendarDay: string;
      };
      activityMap.get(day)?.push(mapActivityRowToDTO(rest));
    }

    // Compute segment durations for each day window.
    const allActivityIds = activities.map((r) => String(r["id"]));

    const oldestDay = days[days.length - 1]!;
    const newestDay = days[0]!;
    // Shift day boundaries to UTC using the user's offset.
    const offsetMs = utcOffsetMinutes * 60000;
    const rangeFrom = new Date(
      Date.parse(`${oldestDay}T00:00:00.000Z`) - offsetMs,
    ).toISOString();
    const rangeTo = new Date(
      Date.parse(`${newestDay}T00:00:00.000Z`) - offsetMs + 86400000 - 1,
    ).toISOString();

    const segments =
      allActivityIds.length > 0
        ? await activitySessionSegmentQueries.listSegmentIntervalsForMultipleActivitiesInRange(
            allActivityIds,
            rangeFrom,
            rangeTo,
          )
        : [];

    // Map each segment's activityId to its calendarDay so we can bucket durations.
    const activityDayMap = new Map<string, string>();
    for (const row of activities) {
      activityDayMap.set(String(row["id"]), String(row["calendarDay"]));
    }

    const floorMs = (n: number) => Math.floor(Math.max(0, n));

    type DurAgg = { activeDurationMs: number; pauseDurationMs: number };

    // Per-day group totals.
    const dayDurations = new Map<string, DurAgg>();
    for (const day of days) {
      dayDurations.set(day, { activeDurationMs: 0, pauseDurationMs: 0 });
    }

    // Per-activity durations clipped to the day they belong to.
    const activityDayDurations = new Map<string, DurAgg>();
    for (const row of activities) {
      activityDayDurations.set(String(row["id"]), {
        activeDurationMs: 0,
        pauseDurationMs: 0,
      });
    }

    for (const seg of segments) {
      const day = activityDayMap.get(seg.activityId);
      if (!day) continue;

      const dayAgg = dayDurations.get(day);
      if (!dayAgg) continue;

      // day is a local calendar date; shift to UTC to get the actual window.
      const windowFromMs =
        Date.parse(`${day}T00:00:00.000Z`) - utcOffsetMinutes * 60000;
      const windowToMs = windowFromMs + 86400000;

      const clip = clipSegmentToWindow(
        seg.startedAt,
        seg.endedAt,
        windowFromMs,
        windowToMs,
      );
      if (!clip) continue;

      const ms = clip.end - clip.start;

      if (seg.type === "active") {
        dayAgg.activeDurationMs += ms;
      } else {
        dayAgg.pauseDurationMs += ms;
      }

      const actAgg = activityDayDurations.get(seg.activityId);
      if (actAgg) {
        if (seg.type === "active") {
          actAgg.activeDurationMs += ms;
        } else {
          actAgg.pauseDurationMs += ms;
        }
      }
    }

    const groups: GetGroupedActivitiesResponseDTO["groups"] = days.map(
      (day) => {
        const dayFromMs = Date.parse(`${day}T00:00:00.000Z`);
        const dayToMs = dayFromMs + 86400000;
        const durations = dayDurations.get(day) ?? {
          activeDurationMs: 0,
          pauseDurationMs: 0,
        };

        const items = (activityMap.get(day) ?? []).map((activity) => {
          const dur = activityDayDurations.get(activity.id);
          if (!dur) return activity;
          return {
            ...activity,
            activeDurationMs: floorMs(dur.activeDurationMs),
            pauseDurationMs: floorMs(dur.pauseDurationMs),
          };
        });

        // groupDateStart/End represent the local day boundaries in UTC.
        const localMidnightUtcMs = dayFromMs - utcOffsetMinutes * 60000;

        return {
          groupDateStart: new Date(localMidnightUtcMs).toISOString(),
          groupDateEnd: new Date(localMidnightUtcMs + 86400000).toISOString(),
          items,
          hasMoreItems: false,
          totalActiveDurationMs: floorMs(durations.activeDurationMs),
          totalPauseDurationMs: floorMs(durations.pauseDurationMs),
        };
      },
    );

    let nextCursor: string | null = null;
    if (hasNext) {
      const oldestReturnedDay = days[days.length - 1]!;
      nextCursor = encodeCursor({
        groupBy: "day",
        groupStart: `${oldestReturnedDay}T00:00:00.000Z`,
        groupEnd: `${oldestReturnedDay}T00:00:00.000Z`,
        offsetInGroup: 0,
      });
    }

    return {
      success: true,
      data: {
        groups,
        pagination: { nextCursor, hasNext },
      },
    };
  } catch (error) {
    console.error("Get grouped activities error:", error);
    return {
      success: false,
      message: "Failed to fetch grouped activities",
    };
  }
};

export const activitiesService = {
  createActivity,
  createActivityFromQuickTimer,
  updateActivity,
  deleteActivity,
  getActivityById,
  getActivitiesByIds,
  getActivities,
  startActivity,
  pauseActivity,
  finishActivity,
  getSessionsByActivityId,
  getSessionSegmentsByActivityId,
  getActivityAnalytics,
  getActivitiesAnalytics,
  getGroupedActivities,
};
