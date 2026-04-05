import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

export const getLocalDayBoundsIso = (dayKey: string) => {
  const dayStart = new Date(`${dayKey}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { fromDate: dayStart.toISOString(), toDate: dayEnd.toISOString() };
};

export type DisplayedSecondsInput = {
  /** Segment-based active ms for the card’s day window (from getActivityAnalytics). */
  currentActiveMs: number;
  /** `useQuery`’s `dataUpdatedAt` when analytics succeeded; 0 = unknown, no drift. */
  analyticsFetchedAtMs: number;
  hasActiveSession: boolean;
  nowMs: number;
};

/**
 * Server baseline already includes open active segment up to fetch time.
 * While ticking, add wall-clock drift since that fetch.
 */
export function resolveDisplayedSeconds({
  currentActiveMs,
  analyticsFetchedAtMs,
  hasActiveSession,
  nowMs,
}: DisplayedSecondsInput): number {
  const driftMs =
    hasActiveSession && analyticsFetchedAtMs > 0
      ? Math.max(0, nowMs - analyticsFetchedAtMs)
      : 0;

  const totalMs = currentActiveMs + driftMs;

  return Math.max(0, Math.floor(totalMs / 1000));
}

export function formatDurationLabel(totalSeconds: number): string {
  return convertTimeObjectToTimeString(
    convertSecondsToTimeObject(totalSeconds),
  );
}
