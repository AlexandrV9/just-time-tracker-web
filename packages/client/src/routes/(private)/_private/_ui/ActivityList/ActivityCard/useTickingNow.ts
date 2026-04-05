import { useEffect, useState } from "react";

/**
 * While `enabled`, updates every second so consumers can derive UI from `Date.now()` safely
 * (no fake “tick” counter only used to bust memoization).
 */
export function useTickingNow(enabled: boolean): number {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setNowMs(Date.now());

    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [enabled]);

  return nowMs;
}
