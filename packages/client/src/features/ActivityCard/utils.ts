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
  /**
   * true только в первый рендер после перехода inactive → active.
   * В этот момент nowMs ещё stale (useLiveTimestamp effect не отработал),
   * поэтому нельзя сохранять его как resumedAtWallClockMs.
   */
  isJustActivated: boolean;
};

export function calculateDisplayedSeconds({
  currentActiveMs,
  analyticsFetchedAtMs,
  hasActiveSession,
  nowMs,
  lastStableSeconds,
  resumedAtWallClockMs,
  isJustActivated,
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
   * Чтобы избежать скачка назад в момент паузы/завершения
   * (до рефетча analytics), используем локально вычисленное значение
   * как нижнюю границу.
   *
   * - Первый рендер после паузы: resumedAtWallClockMs ещё установлен,
   *   вычисляем живое значение через lastStableSeconds + delta.
   * - Последующие рендеры: resumedAtWallClockMs уже сброшен,
   *   используем lastStableSeconds как сохранённую нижнюю границу.
   * - После рефетча analytics: serverDrivenSeconds обновляется до верного
   *   значения, max(...) отдаёт его.
   */
  if (!hasActiveSession) {
    let displayedSeconds = serverDrivenSeconds;

    if (lastStableSeconds !== null && resumedAtWallClockMs !== null) {
      const localDelta = Math.floor((nowMs - resumedAtWallClockMs) / 1000);
      displayedSeconds = Math.max(
        serverDrivenSeconds,
        lastStableSeconds + localDelta,
      );
    } else if (lastStableSeconds !== null) {
      displayedSeconds = Math.max(serverDrivenSeconds, lastStableSeconds);
    }

    return {
      displayedSeconds,
      nextLastStableSeconds: displayedSeconds,
      nextResumedAtWallClockMs: null,
    };
  }

  /**
   * 🟡 Состояние: активна, но у нас нет "снапшота"
   *
   * Это означает:
   * - либо мы только что смонтировались (активность уже была запущена)
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
   * Если это первый рендер после перехода inactive → active (isJustActivated),
   * nowMs ещё stale: useLiveTimestamp инициализируется при монтировании
   * и обновляется только через useEffect. Откладываем захват
   * resumedAtWallClockMs до следующего рендера, когда nowMs станет свежим.
   *
   * На следующем рендере (triggered useEffect → setTimestamp):
   * resumedAtWallClockMs всё ещё null → захватываем свежий nowMs → delta = 0.
   */
  if (isJustActivated) {
    return {
      displayedSeconds: lastStableSeconds,
      nextLastStableSeconds: lastStableSeconds,
      nextResumedAtWallClockMs: null,
    };
  }

  const effectiveResumedAtWallClockMs = resumedAtWallClockMs ?? nowMs;

  const localLiveDeltaSeconds = Math.floor(
    (nowMs - effectiveResumedAtWallClockMs) / 1000,
  );

  return {
    displayedSeconds: lastStableSeconds + localLiveDeltaSeconds,
    nextLastStableSeconds: lastStableSeconds,
    nextResumedAtWallClockMs: effectiveResumedAtWallClockMs,
  };
}
