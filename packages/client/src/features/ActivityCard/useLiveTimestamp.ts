import { useEffect, useState } from "react";

export function useLiveTimestamp(enabled: boolean): number {
  const [timestamp, setTimestamp] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;

    setTimestamp(Date.now());

    const intervalId = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [enabled]);

  return timestamp;
}
