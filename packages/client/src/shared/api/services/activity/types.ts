import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";

import type { CalendarDay } from "~/shared/libs";

export type ActivityId = ActivityDTO["id"] & { __brand: "ActivityId" };

export type ActivityGroup = {
  label: string;
  totalActiveTime: number;
  activities: ActivityState[];
  activeTimerCalendarDay?: CalendarDay;
};

export type ActivityState = {
  activity: ActivityDTO;
  session?: ActivitySessionDTO | null;
  segment?: ActivitySessionSegmentDTO | null;
};
