import { useCallback, useMemo, useState } from "react";
import type { TimeObject } from "./types";

export const useTimePicker = (initialTimeObj: TimeObject) => {
  const [value, setValue] = useState<TimeObject>(() => initialTimeObj);

  const setTime = useCallback(
    (value: { hours: number; minutes: number; seconds: number }) => {
      setValue(value);
    },
    []
  );

  const setHours = useCallback((hours: number) => {
    setValue((prev) => ({ ...prev, hours }));
  }, []);

  const setMinutes = useCallback((minutes: number) => {
    setValue((prev) => ({ ...prev, minutes }));
  }, []);

  const setSeconds = useCallback((seconds: number) => {
    setValue((prev) => ({ ...prev, seconds }));
  }, []);

  const timeResult = useMemo(() => {
    return value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.hours, value.minutes, value.seconds]);

  return {
    time: timeResult,
    setHours,
    setMinutes,
    setSeconds,
    setTime,
  };
};

export type GetTimeStringOptions = {
  separator?: string;
  formater?: (time: { h: string; m: string; s: string | undefined }) => string;
};

export const getTimeString = (
  time: Omit<TimeObject, "seconds"> & { seconds?: undefined | number },
  options?: GetTimeStringOptions
) => {
  const { separator = ":", formater } = options || {};

  const _hours = time.hours.toString().padStart(2, "0");
  const _minutes = time.minutes.toString().padStart(2, "0");
  const _seconds = time.seconds?.toString().padStart(2, "0");

  if (formater) {
    return formater({ h: _hours, m: _minutes, s: _seconds });
  }

  return [_hours, _minutes, _seconds].filter(Boolean).join(separator);
};
