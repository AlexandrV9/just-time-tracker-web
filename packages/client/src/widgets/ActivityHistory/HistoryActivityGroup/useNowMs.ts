import { useEffect, useState } from "react";

export function useNowMs(enabled: boolean): number | null {
  const [nowMs, setNowMs] = useState<number | null>(() =>
    enabled ? Date.now() : null,
  );

  useEffect(() => {
    if (!enabled) {
      setNowMs(null);
      return;
    }

    setNowMs(Date.now());

    const intervalId = setInterval(() => setNowMs(Date.now()), 1000);

    return () => clearInterval(intervalId);
  }, [enabled]);

  return enabled ? nowMs : null;
}
