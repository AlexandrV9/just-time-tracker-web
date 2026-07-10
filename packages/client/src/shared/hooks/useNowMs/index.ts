import { useEffect, useState } from "react";

export function useNowMs(enabled: boolean, syncKey?: unknown): number | null {
  const [nowMs, setNowMs] = useState<number | null>(() =>
    enabled ? Date.now() : null,
  );

  useEffect(() => {
    if (!enabled) {
      setNowMs(null);
      return;
    }

    let timeoutId: number;

    const tick = () => {
      const now = Date.now();
      const delay = 1000 - (now % 1000);

      setNowMs(now);
      timeoutId = window.setTimeout(tick, delay);
    };

    tick();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, syncKey]);

  return enabled ? nowMs : null;
}
