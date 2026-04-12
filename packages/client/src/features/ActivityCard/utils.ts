import type {
  ActivitySessionStatusDTO,
  ActivityStatusDTO,
} from "@to-do-list/shared";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

export type ResolveDisplayedSecondsProps = {
  /**
   * Суммарное активное время активности за день в ms
   */
  currentActiveMs: number;
  /**
   * Когда эти данные были получены
   */
  analyticsFetchedAtMs: number;
  /**
   * Есть ли сейчас активная сессия.
   */
  hasActiveSession: boolean;
  /**
   * Текущее время
   */
  nowMs: number;
};

export function resolveDisplayedSeconds({
  currentActiveMs,
  analyticsFetchedAtMs,
  hasActiveSession,
  nowMs,
}: ResolveDisplayedSecondsProps) {
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

export type ResolveHasActiveSessionProps = {
  activityStatus?: ActivityStatusDTO;
  currentSessionStatus?: ActivitySessionStatusDTO;
};

export function resolveHasActiveSession({
  currentSessionStatus,
  activityStatus,
}: ResolveHasActiveSessionProps) {
  if (currentSessionStatus) {
    return currentSessionStatus === "active";
  }

  if (activityStatus) {
    return activityStatus === "active";
  }

  return false;
}

