import type { ActivitySessionDTO } from "@to-do-list/shared";

export const getLocalDayBoundsIso = (dayKey: string) => {
  const dayStart = new Date(`${dayKey}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { fromDate: dayStart.toISOString(), toDate: dayEnd.toISOString() };
};

export const computeTrackedSeconds = (
  sessions: ActivitySessionDTO[],
): number => {
  const ms = sessions.reduce((sum, s) => sum + s.activeDurationMs, 0);
  return Math.floor(ms / 1000);
};

/**
 * Active time for today while the current session is running:
 * other sessions’ active ms for the day + this session’s denormalized ms + open active segment.
 */
export const computeLiveActiveSeconds = (
  session: ActivitySessionDTO,
  openSegmentStartedAtIso: string,
  otherSessionsActiveMsToday: number,
  nowMs: number = Date.now(),
): number => {
  const openStart = new Date(openSegmentStartedAtIso).getTime();
  const liveMs =
    otherSessionsActiveMsToday + session.activeDurationMs + (nowMs - openStart);
  return Math.max(0, Math.floor(liveMs / 1000));
};
