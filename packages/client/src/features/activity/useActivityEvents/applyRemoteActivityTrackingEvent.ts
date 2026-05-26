import type { ActivityTrackingEventDTO } from "@to-do-list/shared";
import type { CurrentActivityStore } from "../useCurrentActivity/useCurrentActivityStore";

export function applyRemoteActivityTrackingEvent(
  event: ActivityTrackingEventDTO,
  updateData: CurrentActivityStore["updateData"],
) {
  const { activity, session, segment } = event.data;

  switch (event.type) {
    case "started":
      updateData({
        currentActivity: activity,
        currentSession: session,
        currentSegment: segment,
      });
      break;
    case "paused":
      updateData({
        currentActivity: activity,
        currentSession: session,
        currentSegment: null,
      });
      break;
    case "finished":
      updateData({
        currentActivity: activity,
        currentSession: null,
        currentSegment: null,
      });
      break;
  }
}
