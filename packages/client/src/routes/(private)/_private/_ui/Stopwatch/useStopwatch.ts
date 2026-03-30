import { useCallback, useEffect, useRef, useState } from "react";

export type StopwatchStatus = "idle" | "running" | "paused";

type PersistedState = {
  startedAt: number | null;
  accumulatedMs: number;
  status: StopwatchStatus;
};

const STORAGE_KEY = "pwa-stopwatch";

export function useStopwatch(onStop?: (seconds: number) => void) {
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<StopwatchStatus>("idle");

  const startedAtRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);
  const statusRef = useRef<StopwatchStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeElapsedMs = () => {
    if (statusRef.current === "running" && startedAtRef.current !== null) {
      return accumulatedMsRef.current + (Date.now() - startedAtRef.current);
    }
    return accumulatedMsRef.current;
  };

  const scheduleNextTick = useCallback(() => {
    if (statusRef.current !== "running") return;

    const elapsed = computeElapsedMs();
    const currentSecond = Math.floor(elapsed / 1000);

    setSeconds(currentSecond);

    const delay = 1000 - (elapsed % 1000);

    timeoutRef.current = setTimeout(scheduleNextTick, delay);
  }, []);

  const persist = () => {
    const state: PersistedState = {
      startedAt: startedAtRef.current,
      accumulatedMs: accumulatedMsRef.current,
      status: statusRef.current,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const start = useCallback(() => {
    if (statusRef.current === "running") return;

    startedAtRef.current = Date.now();
    statusRef.current = "running";
    setStatus("running");

    persist();
    scheduleNextTick();
  }, [scheduleNextTick]);

  const pause = useCallback(() => {
    if (statusRef.current !== "running" || startedAtRef.current === null)
      return;

    accumulatedMsRef.current += Date.now() - startedAtRef.current;

    startedAtRef.current = null;
    statusRef.current = "paused";

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setStatus("paused");
    persist();
  }, []);

  const stop = useCallback(() => {
    const finalMs = computeElapsedMs();
    const finalSeconds = Math.floor(finalMs / 1000);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    onStop?.(finalSeconds);

    accumulatedMsRef.current = 0;
    startedAtRef.current = null;
    statusRef.current = "idle";

    setSeconds(0);
    setStatus("idle");

    localStorage.removeItem(STORAGE_KEY);
  }, [onStop]);

  /** Clears timer without calling onStop (e.g. switching tracked session). */
  const discard = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    accumulatedMsRef.current = 0;
    startedAtRef.current = null;
    statusRef.current = "idle";

    setSeconds(0);
    setStatus("idle");

    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const state: PersistedState = JSON.parse(raw);

    startedAtRef.current = state.startedAt;
    accumulatedMsRef.current = state.accumulatedMs;
    statusRef.current = state.status;

    setStatus(state.status);

    const secs = Math.floor(computeElapsedMs() / 1000);
    setSeconds(secs);

    if (state.status === "running") {
      scheduleNextTick();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scheduleNextTick]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (statusRef.current === "running") {
          setSeconds(Math.floor(computeElapsedMs() / 1000));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return {
    seconds,
    status,
    start,
    pause,
    stop,
    discard,
  };
}
