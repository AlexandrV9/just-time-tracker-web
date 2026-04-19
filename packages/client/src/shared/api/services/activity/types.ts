import type { ActivityDTO } from "@to-do-list/shared";

export type ActivityId = ActivityDTO["id"] & { __brand: "ActivityId" };

export type ActivityGroup = {
  label: string;
  totalActiveTime: number;
  activities: ActivityDTO[];
};
