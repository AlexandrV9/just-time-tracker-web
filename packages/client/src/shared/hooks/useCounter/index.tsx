import { useCallback, useEffect, useRef, useState } from "react";

export type UseCounterProps = {
  mode?: "up" | "down";
  initialValue?: number;
  autoStart?: boolean;
  interval?: number;
};

export type Status = "idle" | "running" | "paused";

export const useCounter = (props?: UseCounterProps) => {
  const {
    initialValue = 0,
    autoStart = false,
    interval = 1000,
    mode = "up",
  } = props ?? {};

  const [status, setStatus] = useState<Status>(autoStart ? "running" : "idle");
  const [value, setValue] = useState(initialValue);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onStart = () => {
    setStatus("running");
  };

  const onReset = () => {
    setStatus("idle");
    setValue(initialValue);
  };

  const onStop = () => {
    setStatus("paused");
  };

  const clearTimer = useCallback(() => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (status !== "running") {
      clearTimer();
      return;
    }

    timerRef.current = setInterval(() => {
      setValue((prev) => {
        return mode === "up" ? prev + 1 : prev - 1;
      });
    }, interval);

    return () => clearTimer();
  }, [status, autoStart, interval, mode, clearTimer]);

  return {
    value,
    setValue,
    onStart,
    onStop,
    onReset,
  };
};
