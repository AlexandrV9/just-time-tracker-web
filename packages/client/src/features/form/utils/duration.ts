import {
  convertSecondsToTimeObject,
  convertTimeObjectToSeconds,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

export const secondsToTimeInputValue = (valueSeconds: number) =>
  convertTimeObjectToTimeString(convertSecondsToTimeObject(valueSeconds));

export const timeInputValueToSeconds = (value: string) => {
  const [hours = 0, minutes = 0, seconds = 0] = value.split(":").map(Number);
  return convertTimeObjectToSeconds({ hours, minutes, seconds });
};

export const prefersTouchDurationPicker = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;
