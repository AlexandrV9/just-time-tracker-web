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
  dayActiveMs: number;
  /** `useQuery`’s `dataUpdatedAt` when analytics succeeded; 0 = unknown, no drift. */
  analyticsFetchedAtMs: number;
  isLiveActiveTicking: boolean;
  nowMs: number;
};

/**
 * Server baseline already includes open active segment up to fetch time.
 * While ticking, add wall-clock drift since that fetch.
 */
export function resolveDisplayedSeconds({
  dayActiveMs,
  analyticsFetchedAtMs,
  isLiveActiveTicking,
  nowMs,
}: DisplayedSecondsInput): number {
  const driftMs =
    isLiveActiveTicking && analyticsFetchedAtMs > 0
      ? Math.max(0, nowMs - analyticsFetchedAtMs)
      : 0;
  const totalMs = dayActiveMs + driftMs;
  return Math.max(0, Math.floor(totalMs / 1000));
}

export function formatDurationLabel(totalSeconds: number): string {
  return convertTimeObjectToTimeString(
    convertSecondsToTimeObject(totalSeconds),
  );
}
