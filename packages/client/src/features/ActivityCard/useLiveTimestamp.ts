import { useEffect, useState } from "react";

export function useLiveTimestamp(enabled: boolean): number | null {
  const [timestamp, setTimestamp] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setTimestamp(null);
      return;
    }

    setTimestamp(Date.now());

    const id = setInterval(() => setTimestamp(Date.now()), 1000);

    return () => clearInterval(id);
  }, [enabled]);

  // Synchronously return null when disabled — even before the effect fires —
  // so stale state from a previous active phase is never exposed.
  return enabled ? timestamp : null;
}
