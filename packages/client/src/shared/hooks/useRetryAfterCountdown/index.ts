import { useEffect, useState } from "react";
import { useNowMs } from "../useNowMs";

export function useRetryAfterCountdown() {
  const [retryAfter, setRetryAfter] = useState<string | null>(null);

  const nowMs = useNowMs(Boolean(retryAfter), retryAfter);
  const nowTs = nowMs ?? Date.now();

  const secondsLeft = retryAfter
    ? Math.max(0, Math.ceil((Date.parse(retryAfter) - nowTs) / 1000))
    : 0;

  const isBlocked = Boolean(retryAfter) && secondsLeft > 0;

  useEffect(() => {
    if (retryAfter && secondsLeft <= 0) {
      setRetryAfter(null);
    }
  }, [retryAfter, secondsLeft]);

  return {
    retryAfter,
    setRetryAfter,
    secondsLeft,
    isBlocked,
  };
}
