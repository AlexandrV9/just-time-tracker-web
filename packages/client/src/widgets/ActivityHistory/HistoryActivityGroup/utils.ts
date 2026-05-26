import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

export function formatDurationLabel(totalSeconds: number): string {
  return convertTimeObjectToTimeString(
    convertSecondsToTimeObject(totalSeconds),
  );
}
