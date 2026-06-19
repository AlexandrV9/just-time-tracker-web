import type { ActivityDTO, ActivityGroupDTO } from "@time-tracker/shared";
import { parseISO } from "date-fns";
import type {
  ActivityState,
} from "~/shared/api/services/activity/types";
import { formatGroupLabel, getCalendarDay } from "~/shared/libs";
import type { CalendarDay } from "~/shared/libs/date/types";

export function rowToActivityForGroup(
  row: ActivityGroupDTO["items"][number],
): ActivityDTO {
  return {
    ...row.activity,
    activeDurationMs: row.activeDurationMs,
    pauseDurationMs: row.pauseDurationMs,
  };
}

export const formatActivityGroups = (
  groups: ActivityGroupDTO[],
  locale: string,
) => {
  const merged = new Map<
    string,
    {
      groupBy: ActivityGroupDTO["groupBy"];
      groupDateStart: string;
      groupDateEnd: string;
      totalActiveDurationMs: number;
      totalPauseDurationMs: number;
      items: ActivityState[];
      itemsPagination: ActivityGroupDTO["itemsPagination"];
    }
  >();

  for (const group of groups) {
    const key = group.groupDateStart;

    if (!merged.has(key)) {
      merged.set(key, {
        groupBy: group.groupBy,
        groupDateStart: group.groupDateStart,
        groupDateEnd: group.groupDateEnd,
        totalActiveDurationMs: group.totalActiveDurationMs,
        totalPauseDurationMs: group.totalPauseDurationMs,
        items: group.items.map((item) => ({
          activity: rowToActivityForGroup(item),
        })),
        itemsPagination: group.itemsPagination,
      });
    } else {
      const bucket = merged.get(key)!;
      bucket.items.push(
        ...group.items.map((item) => ({
          activity: rowToActivityForGroup(item),
        })),
      );
      bucket.itemsPagination = group.itemsPagination;
    }
  }

  return Array.from(merged.values())
    .sort(
      (a, b) =>
        new Date(b.groupDateStart).getTime() -
        new Date(a.groupDateStart).getTime(),
    )
    .map((group) => ({
      key: group.groupDateStart,
      label: formatGroupLabel({
        key: group.groupDateStart,
        groupBy: group.groupBy,
        locale,
      }),
      totalActiveTime: Math.floor(group.totalActiveDurationMs / 1000),
      activities: group.items,
      groupDateStart: group.groupDateStart,
      activeTimerCalendarDay: getCalendarDay(
        parseISO(group.groupDateStart),
      ) as CalendarDay,
      itemsHasMore: group.itemsPagination.hasNext,
      itemsNextCursor: group.itemsPagination.nextCursor,
    }));
};
