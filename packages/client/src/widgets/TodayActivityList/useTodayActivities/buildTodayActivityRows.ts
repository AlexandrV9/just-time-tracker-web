import type { ActivityDTO } from "@to-do-list/shared";
import type { ActivityState } from "~/shared/api/services";

type BuildTodayActivityRowsProps = {
  planActivities: ActivityDTO[];
  currentActivities: ActivityState[];
  analyticsItemsMap: Record<string, number>;
};

export function buildTodayActivityRows({
  planActivities,
  currentActivities,
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

  return [...plannedRows, ...appendedCurrentRows];
}

function withTodayActiveDuration(
  activity: ActivityDTO,
  analyticsItemsMap: Record<string, number>,
): ActivityDTO {
  return {
    ...activity,
    activeDurationMs: analyticsItemsMap[activity.id] ?? 0,
  };
}
