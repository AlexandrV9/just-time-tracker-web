import { useMemo } from "react";
import type {
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@time-tracker/shared";
import { useTranslation } from "~/shared/hooks";

type ChartSegment = {
  name: string;
  value: number;
  color: string;
};

type ClippedSegment = {
  startMs: number;
  endMs: number;
  seconds: number;
  type: "active" | "pause";
  sessionId: string;
};

export type SessionChart = {
  session: ActivitySessionDTO;
  sessionStartMs: number;
  sessionEndMs: number;
  barFromMs: number;
  barToMs: number;
  chartData: ChartSegment[];
  activeSecs: number;
  pauseSecs: number;
  label: string;
};

export type DayChart = {
  chartData: ChartSegment[];
  activeSecs: number;
  pauseSecs: number;
  label: string;
};

const STEP_MINUTES = 15;
const STEP_MS = STEP_MINUTES * 60 * 1000;

const floorToStepMs = (ms: number) => Math.floor(ms / STEP_MS) * STEP_MS;

const ceilToStepMs = (ms: number) => {
  const remainder = ms % STEP_MS;
  if (remainder === 0) return ms;
  return ms + (STEP_MS - remainder);
};

const clipSegmentToDay = (
  segment: ActivitySessionSegmentDTO,
  dayFromMs: number,
  dayToMs: number,
): ClippedSegment | null => {
  const startMs = Date.parse(segment.startedAt);

  const naturalEndMs = segment.endedAt
    ? Date.parse(segment.endedAt)
    : Date.now();

  if (!Number.isFinite(startMs) || !Number.isFinite(naturalEndMs)) return null;

  const clippedStart = Math.max(startMs, dayFromMs);
  const clippedEnd = Math.min(naturalEndMs, dayToMs);

  if (clippedEnd <= clippedStart) return null;

  return {
    startMs: clippedStart,
    endMs: clippedEnd,
    seconds: Math.max(1, Math.round((clippedEnd - clippedStart) / 1000)),
    type: segment.type,
    sessionId: segment.sessionId,
  };
};

type UseActivityDayChartsParams = {
  fromDate: string;
  toDate: string;
  segments: ActivitySessionSegmentDTO[] | undefined;
  sessions: ActivitySessionDTO[] | undefined;
};

// Активности не завершенные вчера, должны показываться в новом дне!!!!

export const useActivityDayCharts = ({
  fromDate,
  toDate,
  segments,
  sessions,
}: UseActivityDayChartsParams) => {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    const timeFormatter = new Intl.DateTimeFormat(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
    });

    const dayFromMs = Date.parse(fromDate);
    const dayToMs = Date.parse(toDate);

    const clippedSegments: ClippedSegment[] = (segments ?? []).flatMap(
      (segment) => {
        const c = clipSegmentToDay(segment, dayFromMs, dayToMs);
        return c ? [c] : [];
      },
    );

    const segsInDay = [...clippedSegments].sort(
      (a, b) => a.startMs - b.startMs,
    );
    const dayChartData: ChartSegment[] = [];
    let dayActiveSecs = 0;
    let dayPauseSecs = 0;
    let dayGapIdx = 0;
    const dayUsedNames = new Set<string>();
    const dayBarFromMs =
      segsInDay.length > 0
        ? Math.max(dayFromMs, floorToStepMs(segsInDay[0]!.startMs))
        : dayFromMs;
    const dayBarToMs =
      segsInDay.length > 0
        ? Math.min(dayToMs, ceilToStepMs(segsInDay.at(-1)!.endMs))
        : dayToMs;

    let cursor = dayBarFromMs;

    for (const seg of segsInDay) {
      if (seg.startMs > cursor) {
        const gapSecs = Math.round((seg.startMs - cursor) / 1000);
        if (gapSecs > 0) {
          dayChartData.push({
            name: `__gap__day__${dayGapIdx++}`,
            value: gapSecs,
            color: "gray.subtle",
          });
        }
      }

      const label =
        seg.type === "active"
          ? t("widgets.activityAnalytics.active")
          : t("widgets.activityAnalytics.pause");

      const baseName = `${label} ${timeFormatter.format(new Date(seg.startMs))}\u2013${timeFormatter.format(new Date(seg.endMs))}`;
      let uniqueName = baseName;
      let nameCounter = 2;
      while (dayUsedNames.has(uniqueName)) {
        uniqueName = `${baseName} (${nameCounter++})`;
      }
      dayUsedNames.add(uniqueName);

      dayChartData.push({
        name: uniqueName,
        value: seg.seconds,
        color: seg.type === "active" ? "teal.solid" : "orange.solid",
      });

      if (seg.type === "active") dayActiveSecs += seg.seconds;
      else dayPauseSecs += seg.seconds;

      cursor = seg.endMs;
    }

    if (cursor < dayBarToMs) {
      const gapSecs = Math.round((dayBarToMs - cursor) / 1000);
      if (gapSecs > 0) {
        dayChartData.push({
          name: `__gap__day__${dayGapIdx++}`,
          value: gapSecs,
          color: "gray.subtle",
        });
      }
    }

    if (dayChartData.length === 0) {
      dayChartData.push({
        name: `__gap__day__${dayGapIdx++}`,
        value: Math.max(1, Math.round((dayBarToMs - dayBarFromMs) / 1000)),
        color: "gray.subtle",
      });
    }

    const sessionsInDay: SessionChart[] = (sessions ?? [])
      .flatMap((s) => {
        const startedAtMs = Date.parse(s.startedAt);
        const naturalEndMs = s.endedAt ? Date.parse(s.endedAt) : Date.now();
        if (!Number.isFinite(startedAtMs) || !Number.isFinite(naturalEndMs)) {
          return [];
        }

        const sessionStartMs = Math.max(startedAtMs, dayFromMs);
        const sessionEndMs = Math.min(naturalEndMs, dayToMs);
        if (sessionEndMs <= sessionStartMs) return [];

        const barFromMs = Math.max(dayFromMs, floorToStepMs(sessionStartMs));
        const barToMs = Math.min(dayToMs, ceilToStepMs(sessionEndMs));

        const segs = clippedSegments
          .filter((seg) => seg.sessionId === s.id)
          .map((seg) => ({
            ...seg,
            startMs: Math.max(seg.startMs, sessionStartMs),
            endMs: Math.min(seg.endMs, sessionEndMs),
          }))
          .flatMap((seg) => {
            if (seg.endMs <= seg.startMs) return [];
            return [
              {
                ...seg,
                seconds: Math.max(
                  1,
                  Math.round((seg.endMs - seg.startMs) / 1000),
                ),
              },
            ];
          })
          .sort((a, b) => a.startMs - b.startMs);

        let sCursor = barFromMs;
        let activeSecs = 0;
        let pauseSecs = 0;
        let gapIdx = 0;
        const sessionUsedNames = new Set<string>();

        const chartData: ChartSegment[] = [];

        for (const seg of segs) {
          if (seg.startMs > sCursor) {
            const gapSecs = Math.round((seg.startMs - sCursor) / 1000);
            if (gapSecs > 0) {
              chartData.push({
                name: `__gap__${s.id}__${gapIdx++}`,
                value: gapSecs,
                color: "gray.subtle",
              });
            }
          }

          const segLabel =
            seg.type === "active"
              ? t("widgets.activityAnalytics.active")
              : t("widgets.activityAnalytics.pause");

          const segBaseName = `${segLabel} ${timeFormatter.format(new Date(seg.startMs))}\u2013${timeFormatter.format(new Date(seg.endMs))}`;
          let segUniqueName = segBaseName;
          let segNameCounter = 2;
          while (sessionUsedNames.has(segUniqueName)) {
            segUniqueName = `${segBaseName} (${segNameCounter++})`;
          }
          sessionUsedNames.add(segUniqueName);

          chartData.push({
            name: segUniqueName,
            value: seg.seconds,
            color: seg.type === "active" ? "teal.solid" : "orange.solid",
          });

          if (seg.type === "active") activeSecs += seg.seconds;
          else pauseSecs += seg.seconds;

          sCursor = seg.endMs;
        }

        if (sCursor < barToMs) {
          const gapSecs = Math.round((barToMs - sCursor) / 1000);
          if (gapSecs > 0) {
            chartData.push({
              name: `__gap__${s.id}__${gapIdx++}`,
              value: gapSecs,
              color: "gray.subtle",
            });
          }
        }

        if (chartData.length === 0) {
          chartData.push({
            name: `__gap__${s.id}__${gapIdx++}`,
            value: Math.max(1, Math.round((barToMs - barFromMs) / 1000)),
            color: "gray.subtle",
          });
        }

        return [
          {
            session: s,
            sessionStartMs,
            sessionEndMs,
            barFromMs,
            barToMs,
            chartData,
            activeSecs,
            pauseSecs,
            label: `${timeFormatter.format(new Date(barFromMs))}\u2013${timeFormatter.format(new Date(barToMs))}`,
          },
        ];
      })
      .sort((a, b) => a.sessionStartMs - b.sessionStartMs);

    const totalActive = sessionsInDay.reduce((acc, s) => acc + s.activeSecs, 0);
    const totalPause = sessionsInDay.reduce((acc, s) => acc + s.pauseSecs, 0);

    return {
      sessions: sessionsInDay,
      dayChart: {
        chartData: dayChartData,
        activeSecs: dayActiveSecs,
        pauseSecs: dayPauseSecs,
        label: `${timeFormatter.format(new Date(dayBarFromMs))}\u2013${timeFormatter.format(new Date(dayBarToMs))}`,
      } satisfies DayChart,
      activeTotalSecs: totalActive,
      pauseTotalSecs: totalPause,
    };
  }, [fromDate, i18n.language, segments, sessions, t, toDate]);
};
