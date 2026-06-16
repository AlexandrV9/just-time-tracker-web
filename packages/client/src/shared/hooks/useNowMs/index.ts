import { useEffect, useState } from "react";

export function useNowMs(enabled: boolean, syncKey?: unknown): number | null {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setNowMs(null);
      return;
    }

    setNowMs(Date.now());

    const intervalId = setInterval(() => setNowMs(Date.now()), 1000);

    return () => clearInterval(intervalId);
  }, [enabled, syncKey]);

  return enabled ? nowMs : null;
}
