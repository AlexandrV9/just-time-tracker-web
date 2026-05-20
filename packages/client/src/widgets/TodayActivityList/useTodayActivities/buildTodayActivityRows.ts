import type { ActivityDTO } from "@to-do-list/shared";
import type { ActivityState } from "~/shared/api/services";

type BuildTodayActivityRowsProps = {
  planActivities: ActivityDTO[];
  currentActivities: ActivityState[];
  trackedActivities: ActivityState[];
  analyticsItemsMap: Record<string, number>;
};

export function buildTodayActivityRows({
  planActivities,
  currentActivities,
  trackedActivities,
  analyticsItemsMap,
}: BuildTodayActivityRowsProps): ActivityState[] {
  const currentByActivityId = new Map(
    currentActivities.map((item) => [item.activity.id, item]),
  );

  const plannedRows = planActivities.map((activity) => {
    const current = currentByActivityId.get(activity.id);

    return {
      activity: withTodayActiveDuration(activity, analyticsItemsMap),
      session: current?.session ?? null,
      segment: current?.segment ?? null,
    } satisfies ActivityState;
  });

  const plannedActivityIds = new Set(plannedRows.map((row) => row.activity.id));

  const appendedCurrentRows = currentActivities
    .filter((row) => !plannedActivityIds.has(row.activity.id))
    .map(
      (row) =>
        ({
          session: row.session ?? null,
          segment: row.segment ?? null,
          activity: withTodayActiveDuration(row.activity, analyticsItemsMap),
        }) satisfies ActivityState,
    );

  const mergedIds = new Set([
    ...plannedActivityIds,
    ...appendedCurrentRows.map((row) => row.activity.id),
  ]);

  const appendedTrackedRows = trackedActivities
    .filter((row) => !mergedIds.has(row.activity.id))
    .filter((row) => getTodayActiveDurationMs(row.activity, analyticsItemsMap) > 0)
    .map(
      (row) =>
        ({
          session: null,
          segment: null,
          activity: withTodayActiveDuration(row.activity, analyticsItemsMap),
        }) satisfies ActivityState,
    );

  return [...plannedRows, ...appendedCurrentRows, ...appendedTrackedRows];
}

function getTodayActiveDurationMs(
  activity: ActivityDTO,
  analyticsItemsMap: Record<string, number>,
): number {
  return analyticsItemsMap[activity.id] ?? activity.activeDurationMs ?? 0;
}

function withTodayActiveDuration(
  activity: ActivityDTO,
  analyticsItemsMap: Record<string, number>,
): ActivityDTO {
  return {
    ...activity,
    activeDurationMs: getTodayActiveDurationMs(activity, analyticsItemsMap),
  };
}
