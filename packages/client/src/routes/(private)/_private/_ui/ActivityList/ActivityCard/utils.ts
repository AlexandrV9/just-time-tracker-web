import type { ActivitySessionSegmentDTO } from "@to-do-list/shared";

function msFromUnknown(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function openSegmentElapsedMs(
  openSegment: ActivitySessionSegmentDTO | null | undefined,
): number {
  if (!openSegment || openSegment.endedAt != null) {
    return 0;
  }
  if (openSegment.type !== "active") {
    return 0;
  }
  const started = new Date(openSegment.startedAt).getTime();
  if (!Number.isFinite(started)) {
    return 0;
  }
  return Math.max(0, Date.now() - started);
}

export function computeTrackedSeconds(params: {
  isLinkedToMainStopwatch: boolean;
  linkedSeconds: number;
  activeDurationMs: number;
  pauseDurationMs: number;
  openSegment: ActivitySessionSegmentDTO | null | undefined;
  tick: number;
}): number {
  if (params.isLinkedToMainStopwatch) {
    return params.linkedSeconds;
  }

  const baseMs =
    msFromUnknown(params.activeDurationMs) +
    msFromUnknown(params.pauseDurationMs);
  const openExtraMs = openSegmentElapsedMs(params.openSegment);

  void params.tick;
  return Math.floor((baseMs + openExtraMs) / 1000);
}
