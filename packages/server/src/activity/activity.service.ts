import type { WithCreatedById } from "../shared/auth/with-created-by-id.js";
import type { ActivityTrackingEventTypeDTO } from "@to-do-list/shared";
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
  GetGroupedActivitiesQueryDTO,
  GetGroupedActivitiesResponseDTO,
  GetGroupedActivityItemsQueryDTO,
  GetGroupedActivityItemsResponseDTO,
  GetActivitiesAnalyticsResponseDTO,
  GetActivitiesAnalyticsQueryDTO,
  GetActivitySessionSegmentsDTO,
  GetActivitySessionSegmentsResponseDTO,
  GetCurrentActivitiesQueryDTO,
  GetCurrentActivitiesResponseDTO,
  GetTrackedActivitiesQueryDTO,
  GetTrackedActivitiesResponseDTO,
  ActivitySessionSegmentDTO,
  StartActivityDataDTO,
  PauseActivityDataDTO,
  FinishActivityDataDTO,
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
import {
  activitySessionQueries,
  mapActivitySessionRowToDTO,
} from "./activitySession.queries.js";
import {
  activitySessionSegmentQueries,
  mapSegmentRow,
} from "./activitySessionSegment.queries.js";
import { activityEventsHub } from "./activityEvents.hub.js";
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
  // Open segments (endedAt = null) are excluded so that activeDurationMs from
  // analytics represents only completed work. The client adds the running
  // segment's elapsed time via: activeDurationMs + (now - segmentStartedAt).
  if (!endedAtIso) return null;

  const startMs = Date.parse(startedAtIso);
  const naturalEndMs = Date.parse(endedAtIso);
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
  data: WithCreatedById<CreateActivityDataDTO>,
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
  filters: WithCreatedById<GetActivitiesDTO>,
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

function mapCurrentActivitySegmentPayload(
  value: unknown,
): ActivitySessionSegmentDTO | null {
  if (value === null || value === undefined || typeof value !== "object") {
    return null;
  }
  try {
    return mapSegmentRow(value as Record<string, unknown>);
  } catch {
    return null;
  }
}

type GetCurrentActivitiesResponse =
  | SuccessResponse<GetCurrentActivitiesResponseDTO>
  | ErrorResponse;

const getCurrentActivities = async (
  filters: WithCreatedById<GetCurrentActivitiesQueryDTO>,
): Promise<GetCurrentActivitiesResponse> => {
  try {
    const result = await activityQueries.getCurrentActivities(filters);

    return {
      success: true,
      data: {
        ...result,
        data: result.data.map((row) => ({
          activity: mapActivityRowToDTO(
            row.activity as Record<string, unknown>,
          ),
          session:
            row.session == null
              ? null
              : mapActivitySessionRowToDTO(
                  row.session as Record<string, unknown>,
                ),
          segment: mapCurrentActivitySegmentPayload(row.segment),
        })),
      },
    };
  } catch (error) {
    console.error("Get current activities error:", error);
    return {
      success: false,
      message: "Failed to fetch current activities",
    };
  }
};

type SessionTrackingResponse = Awaited<ReturnType<typeof startActivitySession>>;

const publishTrackingEvent = (
  type: ActivityTrackingEventTypeDTO,
  clientId: string | undefined,
  result: Extract<SessionTrackingResponse, { success: true }>,
) => {
  activityEventsHub.publish(result.data.activity.createdById, {
    type,
    clientId,
    data: result.data,
  });
};

const startActivity = async (
  data: StartActivityDataDTO,
): Promise<SessionTrackingResponse> => {
  const result = await startActivitySession(data.activityId, data.startedAt);
  if (result.success) {
    publishTrackingEvent("started", data.clientId, result);
  }
  return result;
};

const pauseActivity = async (
  data: PauseActivityDataDTO,
): Promise<SessionTrackingResponse> => {
  const result = await pauseActivitySession(data.activityId, data.pausedAt);
  if (result.success) {
    publishTrackingEvent("paused", data.clientId, result);
  }
  return result;
};

const finishActivity = async (
  data: FinishActivityDataDTO,
): Promise<SessionTrackingResponse> => {
  const result = await finishActivitySession(data.activityId, data.finishedAt);
  if (result.success) {
    publishTrackingEvent("finished", data.clientId, result);
  }
  return result;
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

type ActivityGroupBy = "day" | "week" | "month";

/** Курсор страницы групп: сдвигаем верхнюю границу интервала вниз по времени (см. `beforeDate`). */
type GroupCursorPayload = {
  type: "groups";
  groupBy: ActivityGroupBy;
  /** Верхняя граница полуинтервала [fromDate, beforeDate) для следующего запроса (исключаем уже отданные группы). */
  beforeDate: string;
  /** Нижняя граница всей выборки; совпадает с fromDate первого запроса. */
  fromDate: string;
  /** Исходный toDate запроса (опционально, для отладки / будущего использования). */
  toDate?: string;
};

/** Курсор страницы элементов внутри одной группы: OFFSET по списку активностей в bucket. */
type ItemsCursorPayload = {
  type: "items";
  groupBy: ActivityGroupBy;
  groupDateStart: string;
  groupDateEnd: string;
  offset: number;
};

type GetGroupedActivitiesResult =
  | SuccessResponse<GetGroupedActivitiesResponseDTO>
  | ErrorResponse;

const encodeCursor = (payload: GroupCursorPayload | ItemsCursorPayload) => {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
};

const decodeCursor = <T>(cursor: string): T | null => {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf8")) as T;
  } catch {
    return null;
  }
};

const hydrateTrackedActivityRows = async (
  items: Array<{
    activityId: string;
    activeDurationMs: number;
    pauseDurationMs: number;
  }>,
) => {
  const activityIds = items.map((item) => item.activityId);
  if (activityIds.length === 0) {
    return [];
  }

  const activityRows = await activityQueries.getActivitiesByIds({
    activityIds,
  });

  const activityById = new Map<string, ActivityDTO>();

  for (const row of activityRows) {
    const dto = mapActivityRowToDTO(row as Record<string, unknown>);
    activityById.set(dto.id, dto);
  }

  return items
    .map((item) => {
      const activity = activityById.get(item.activityId);
      if (!activity) {
        return null;
      }
      return {
        activity,
        activeDurationMs: item.activeDurationMs,
        pauseDurationMs: item.pauseDurationMs,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

type GetTrackedActivitiesResponse =
  | SuccessResponse<GetTrackedActivitiesResponseDTO>
  | ErrorResponse;

const getTrackedActivities = async (
  filters: WithCreatedById<GetTrackedActivitiesQueryDTO>,
): Promise<GetTrackedActivitiesResponse> => {
  try {
    const {
      createdById,
      fromDate,
      toDate,
      page = 0,
      limit = 10,
    } = filters;

    if (!fromDate || !toDate) {
      return {
        success: false,
        message: "fromDate and toDate are required",
      };
    }

    const [rawItemsResult, totalCount] = await Promise.all([
      activitySessionQueries.listActivityTimeItemsInRange({
        createdById,
        fromDate,
        toDate,
        limit,
        offset: page * limit,
        activeOnly: true,
      }),
      activitySessionQueries.countActivityTimeItemsInRange({
        createdById,
        fromDate,
        toDate,
        activeOnly: true,
      }),
    ]);

    const hydrated = await hydrateTrackedActivityRows(rawItemsResult.items);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        data: hydrated.map((item) => ({
          activity: {
            ...item.activity,
            activeDurationMs: item.activeDurationMs,
            pauseDurationMs: item.pauseDurationMs,
          },
          session: null,
          segment: null,
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages - 1,
          hasPrev: page > 0,
        },
      },
    };
  } catch (error) {
    console.error("Get tracked activities error:", error);
    return {
      success: false,
      message: "Failed to fetch tracked activities",
    };
  }
};

/**
 * Первая ступень пагинации: непустые календарные группы за [fromDate, toDate) (toDate по умолчанию — «сейчас»),
 * от новых к старым (`listNonEmptyActivityGroups` ORDER BY group_date_start DESC).
 *
 * Вторая ступень: для каждой группы на этой странице подгружается только первая порция элементов (`itemsLimit`);
 * следующие порции — отдельным методом `getGroupedActivityItems` по `itemsPagination.nextCursor`.
 *
 * Следующая страница групп: `groupsPagination.nextCursor` кодирует `beforeDate` = `groupDateStart` самой «старой»
 * группы на текущей странице, чтобы следующий запрос выбрал bucket'ы строго раньше без дубликатов.
 */
// GET /api/activities/grouped
export const getGroupedActivities = async (
  params: WithCreatedById<GetGroupedActivitiesQueryDTO>,
): Promise<GetGroupedActivitiesResult> => {
  try {
    const {
      createdById,
      groupBy = "day",
      groupCursor,
      groupLimit = 5,
      itemsLimit = 8,
      fromDate,
      toDate,
    } = params;

    const now = new Date().toISOString();

    const decodedGroupCursor = groupCursor
      ? decodeCursor<GroupCursorPayload>(groupCursor)
      : null;

    if (
      groupCursor &&
      (!decodedGroupCursor || decodedGroupCursor.type !== "groups")
    ) {
      return {
        success: false,
        message: "Invalid group cursor",
      };
    }

    const resolvedGroupBy = decodedGroupCursor?.groupBy ?? groupBy;

    // Дефолтный нижний bound — 90 дней до начала текущего UTC-дня.
    const defaultFromDate = (() => {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - 90);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString();
    })();

    const effectiveFromDate =
      decodedGroupCursor?.fromDate ?? fromDate ?? defaultFromDate;
    // Без курсора: [fromDate, toDate∪now). С курсором групп: верхняя граница = beforeDate из курсора.
    const effectiveToDate = decodedGroupCursor?.beforeDate ?? toDate ?? now;

    const rawGroupsResult =
      await activitySessionQueries.listNonEmptyActivityGroups({
        createdById,
        groupBy: resolvedGroupBy,
        fromDate: effectiveFromDate,
        toDate: effectiveToDate,
        limit: groupLimit + 1,
      });

    const hasNextGroups = rawGroupsResult.groups.length > groupLimit;
    const selectedGroups = hasNextGroups
      ? rawGroupsResult.groups.slice(0, groupLimit)
      : rawGroupsResult.groups;

    const responseGroups: GetGroupedActivitiesResponseDTO["groups"] = [];

    // Для каждой группы на странице: суммарное время в bucket + первая страница активностей (offset 0).
    for (const group of selectedGroups) {
      const totals = await activitySessionQueries.getTotalTimeInRange({
        createdById,
        fromDate: group.groupDateStart,
        toDate: group.groupDateEnd,
      });

      const rawItemsResult =
        await activitySessionQueries.listActivityTimeItemsInRange({
          createdById,
          fromDate: group.groupDateStart,
          toDate: group.groupDateEnd,
          limit: itemsLimit + 1,
          offset: 0,
        });

      const hasNextItems = rawItemsResult.items.length > itemsLimit;
      const selectedItems = hasNextItems
        ? rawItemsResult.items.slice(0, itemsLimit)
        : rawItemsResult.items;

      const items = await hydrateTrackedActivityRows(selectedItems);

      responseGroups.push({
        groupBy: resolvedGroupBy,
        groupDateStart: group.groupDateStart,
        groupDateEnd: group.groupDateEnd,
        totalActiveDurationMs: totals.activeDurationMs,
        totalPauseDurationMs: totals.pauseDurationMs,
        items,
        itemsPagination: {
          hasNext: hasNextItems,
          nextCursor: hasNextItems
            ? encodeCursor({
                type: "items",
                groupBy: resolvedGroupBy,
                groupDateStart: group.groupDateStart,
                groupDateEnd: group.groupDateEnd,
                // Первая «догрузка» начинается с offset = число уже отданных строк.
                offset: itemsLimit,
              } satisfies ItemsCursorPayload)
            : null,
        },
      });
    }

    const oldestReturnedGroup = selectedGroups.at(-1);

    const nextGroupCursor =
      hasNextGroups && oldestReturnedGroup
        ? encodeCursor({
            type: "groups",
            groupBy: resolvedGroupBy,
            beforeDate: oldestReturnedGroup.groupDateStart,
            fromDate: effectiveFromDate,
            toDate,
          } satisfies GroupCursorPayload)
        : null;

    return {
      success: true,
      data: {
        groups: responseGroups,
        groupsPagination: {
          hasNext: Boolean(nextGroupCursor),
          nextCursor: nextGroupCursor,
        },
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

type GetGroupedActivityItemsResult =
  | SuccessResponse<GetGroupedActivityItemsResponseDTO>
  | ErrorResponse;

/** Вторая ступень пагинации: только элементы внутри одного bucket; `cursor` — `ItemsCursorPayload` в base64. */
// GET /api/activities/grouped/items?cursor=...&limit=8
export const getGroupedActivityItems = async (
  params: WithCreatedById<GetGroupedActivityItemsQueryDTO>,
): Promise<GetGroupedActivityItemsResult> => {
  try {
    const { createdById, cursor, limit } = params;

    const decodedCursor = decodeCursor<ItemsCursorPayload>(cursor);

    if (!decodedCursor || decodedCursor.type !== "items") {
      return {
        success: false,
        message: "Invalid items cursor",
      };
    }

    const rawItemsResult =
      await activitySessionQueries.listActivityTimeItemsInRange({
        createdById,
        fromDate: decodedCursor.groupDateStart,
        toDate: decodedCursor.groupDateEnd,
        limit: limit + 1,
        offset: decodedCursor.offset,
      });

    const hasNext = rawItemsResult.items.length > limit;

    const selectedItems = hasNext
      ? rawItemsResult.items.slice(0, limit)
      : rawItemsResult.items;

    const items = await hydrateTrackedActivityRows(selectedItems);

    return {
      success: true,
      data: {
        groupBy: decodedCursor.groupBy,
        groupDateStart: decodedCursor.groupDateStart,
        groupDateEnd: decodedCursor.groupDateEnd,
        items,
        pagination: {
          hasNext,
          nextCursor: hasNext
            ? encodeCursor({
                type: "items",
                groupBy: decodedCursor.groupBy,
                groupDateStart: decodedCursor.groupDateStart,
                groupDateEnd: decodedCursor.groupDateEnd,
                offset: decodedCursor.offset + limit,
              } satisfies ItemsCursorPayload)
            : null,
        },
      },
    };
  } catch (error) {
    console.error("Get grouped activity items error:", error);

    return {
      success: false,
      message: "Failed to fetch grouped activity items",
    };
  }
};

export const activitiesService = {
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityById,
  getActivitiesByIds,
  getActivities,
  getCurrentActivities,
  getTrackedActivities,
  startActivity,
  pauseActivity,
  finishActivity,
  getSessionsByActivityId,
  getSessionSegmentsByActivityId,
  getActivityAnalytics,
  getActivitiesAnalytics,
  getGroupedActivities,
  getGroupedActivityItems,
};
