import type {
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@time-tracker/shared";
import { convertMillisecondsToSeconds } from "~/shared/ui";
import { useMemo } from "react";
import { useNowMs } from "~/shared/hooks";

type UseDisplayedSessionSecondsProps = {
  session: ActivitySessionDTO | null;
  segment: ActivitySessionSegmentDTO | null;
};

/**
 * Рассчитывает отображаемое активное время текущей сессии в секундах.
 * Включает сохранённое активное время и время текущего открытого active-сегмента.
 */
export function useDisplayedSessionSeconds({
  session,
  segment,
}: UseDisplayedSessionSecondsProps) {
  const shouldTick =
    segment?.type === "active" &&
    session?.status === "active" &&
    segment?.startedAt != null;

  const nowMs = useNowMs(shouldTick);

  return useMemo(() => {
    if (!session) return 0;

    let displayedMs = session.activeDurationMs;

    if (shouldTick && nowMs != null) {
      const startedAtMs = Date.parse(segment.startedAt);

      if (Number.isFinite(startedAtMs)) {
        displayedMs += Math.max(0, nowMs - startedAtMs);
      }
    }

    return convertMillisecondsToSeconds(displayedMs);
  }, [session, shouldTick, nowMs, segment?.startedAt]);
}
