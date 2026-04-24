import type { ActivityDTO, ActivityGroupDTO } from "@to-do-list/shared";
import { formatGroupLabel } from "~/shared/libs";

export const formatActivityGroups = (
  groups: ActivityGroupDTO[],
  locale: string,
) => {
  const merged = new Map<
    string,
    {
      groupDateStart: string;
      groupDateEnd: string;
      totalActiveDurationMs: number;
      totalPauseDurationMs: number;
      items: ActivityDTO[];
    }
  >();

  for (const group of groups) {
    const key = group.groupDateStart;

    if (!merged.has(key)) {
      merged.set(key, {
        groupDateStart: group.groupDateStart,
        groupDateEnd: group.groupDateEnd,
        totalActiveDurationMs: group.totalActiveDurationMs,
        totalPauseDurationMs: group.totalPauseDurationMs,
        items: [...group.items],
      });
    } else {
      merged.get(key)?.items.push(...group.items);
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
        groupBy: "day",
        locale,
      }),
      totalActiveTime: Math.floor(group.totalActiveDurationMs / 1000),
      activities: group.items,
      groupDateStart: group.groupDateStart,
    }));
};
