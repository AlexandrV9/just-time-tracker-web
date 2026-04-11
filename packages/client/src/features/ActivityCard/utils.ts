import type {
  ActivitySessionStatusDTO,
  ActivityStatusDTO,
} from "@to-do-list/shared";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
} from "~/shared/libs";

export type ResolveDisplayedSecondsProps = {
  /**
   * Суммарное активное время активности за день в ms
   */
  currentActiveMs: number;
  /**
   * Когда эти данные были получены
   */
  analyticsFetchedAtMs: number;
  /**
   * Есть ли сейчас активная сессия.
   */
  hasActiveSession: boolean;
  /**
   * Текущее время
   */
  nowMs: number;
};

export function resolveDisplayedSeconds({
  currentActiveMs,
  analyticsFetchedAtMs,
  hasActiveSession,
  nowMs,
}: ResolveDisplayedSecondsProps) {
  const driftMs =
    hasActiveSession && analyticsFetchedAtMs > 0
      ? Math.max(0, nowMs - analyticsFetchedAtMs)
      : 0;

  const totalMs = currentActiveMs + driftMs;

  return Math.max(0, Math.floor(totalMs / 1000));
}

export function formatDurationLabel(totalSeconds: number): string {
  return convertTimeObjectToTimeString(
    convertSecondsToTimeObject(totalSeconds),
  );
}

export type ResolveHasActiveSessionProps = {
  activityStatus?: ActivityStatusDTO;
  currentSessionStatus?: ActivitySessionStatusDTO;
};

export function resolveHasActiveSession({
  currentSessionStatus,
  activityStatus,
}: ResolveHasActiveSessionProps) {
  if (currentSessionStatus) {
    return currentSessionStatus === "active";
  }

  if (activityStatus) {
    return activityStatus === "active";
  }

  return false;
}

type CalculateDisplayedSecondsProps = {
  currentActiveMs: number;
  analyticsFetchedAtMs: number;
  hasActiveSession: boolean;
  nowMs: number;
  /**
   * Последнее стабильное значение таймера,
   * которое мы запомнили в неактивном состоянии.
   */
  lastStableSeconds: number | null;
  /**
   * Момент локального "resume" в рамках текущего mount.
   */
  resumedAtWallClockMs: number | null;
};

export function calculateDisplayedSeconds({
  currentActiveMs,
  analyticsFetchedAtMs,
  hasActiveSession,
  nowMs,
  lastStableSeconds,
  resumedAtWallClockMs,
}: CalculateDisplayedSecondsProps) {
  /**
   * Базовое значение от сервера:
   *
   * activeDurationMs (на момент последнего fetch)
   * +
   * drift (сколько времени прошло с момента получения данных)
   *
   * Это "истинное" значение, если не учитывать локальные переходы pause/start.
   */
  const serverDrivenSeconds = resolveDisplayedSeconds({
    currentActiveMs,
    analyticsFetchedAtMs,
    hasActiveSession,
    nowMs,
  });

  /**
   * 🔴 Состояние: НЕ активна
   *
   * - сбрасываем локальный resume
   * - сохраняем текущее значение как стабильное
   *
   * Это значение потом будет использовано как база,
   * если пользователь снова нажмёт Start.
   */
  if (!hasActiveSession) {
    return {
      displayedSeconds: serverDrivenSeconds,
      nextLastStableSeconds: serverDrivenSeconds,
      nextResumedAtWallClockMs: null,
    };
  }

  /**
   * 🟡 Состояние: активна, но у нас нет "снапшота"
   *
   * Это означает:
   * - либо мы только что смонтировались
   * - либо ещё не было состояния pause/stop
   *
   * В этом случае можно доверять чисто серверному значению.
   */
  if (lastStableSeconds === null) {
    return {
      displayedSeconds: serverDrivenSeconds,
      nextLastStableSeconds: null,
      nextResumedAtWallClockMs: resumedAtWallClockMs,
    };
  }

  /**
   * 🟢 Состояние: активна и есть стабильная база
   *
   * Если мы только что перешли в active:
   * - фиксируем момент времени (resumedAtWallClockMs)
   *
   * И дальше считаем:
   * base (последнее стабильное значение) +
   * сколько прошло с момента resume
   */
  const effectiveResumedAtWallClockMs = resumedAtWallClockMs ?? nowMs;

  const localLiveDeltaSeconds = Math.floor(
    (nowMs - effectiveResumedAtWallClockMs) / 1000,
  );

  /**
   * Возвращаем:
   * - новое отображаемое значение
   * - те же refs (они остаются стабильными)
   */
  return {
    displayedSeconds: lastStableSeconds + localLiveDeltaSeconds,
    nextLastStableSeconds: lastStableSeconds,
    nextResumedAtWallClockMs: effectiveResumedAtWallClockMs,
  };
}
