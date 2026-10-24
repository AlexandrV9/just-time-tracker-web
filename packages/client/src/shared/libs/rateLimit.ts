export const getRetryAfter = (data: unknown): string | undefined => {
  if (typeof data !== "object" || data === null) return undefined;
  if (!("retryAfter" in data)) return undefined;

  const value = (data as { retryAfter?: unknown }).retryAfter;
  return typeof value === "string" ? value : undefined;
};

export const formatCountdownTime = (totalSeconds: number) => {
  const seconds = Math.max(0, totalSeconds);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
