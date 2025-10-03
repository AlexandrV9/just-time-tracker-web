import { useCallback, useMemo, useState } from "react";

export type TimeType = {
  hours: number;
  minutes: number;
  seconds: number;
};

export const useTimePicker = (initialTime = "00:00:00") => {
  const [value, setValue] = useState<TimeType>(() => {
    const [h, m, s] = initialTime.split(":").map(Number);
    return { hours: h, minutes: m, seconds: s };
  });

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
  time: Omit<TimeType, "seconds"> & { seconds?: undefined | number },
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
