import type { ActivitySessionSegmentDTO } from "@to-do-list/shared";

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

  const baseMs = params.activeDurationMs + params.pauseDurationMs;
  const openExtraMs =
    params.openSegment && params.openSegment.endedAt === null
      ? Date.now() - new Date(params.openSegment.startedAt).getTime()
      : 0;

  void params.tick;
  return Math.floor((baseMs + openExtraMs) / 1000);
}
