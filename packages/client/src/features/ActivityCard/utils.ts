import type {
  ActivitySessionStatusDTO,
  ActivityStatusDTO,
} from "@to-do-list/shared";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

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

