import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";

import type { CalendarDay } from "~/shared/libs";

export type ActivityId = ActivityDTO["id"] & { __brand: "ActivityId" };

/** One row in a day group list (plan + optional session context from `/activities/current`). */
export type ActivityGroupRow = {
  activity: ActivityDTO;
  session?: ActivitySessionDTO | null;
  segment?: ActivitySessionSegmentDTO | null;
};

export type ActivityGroup = {
  label: string;
  totalActiveTime: number;
  activities: ActivityGroupRow[];
  activeTimerCalendarDay?: CalendarDay;
};
