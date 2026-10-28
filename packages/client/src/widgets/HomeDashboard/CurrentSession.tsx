import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_ACTIVITY_SETTINGS } from "@time-tracker/shared";
import { useCurrentActivity } from "~/features/activity";
import { useTranslation } from "~/shared/hooks";
import {
  ACTIVITY_SETTINGS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import {
  ActionButton,
  ChevronUpIcon,
  PanelHeading,
  SessionControls,
  StatusBadge,
  Surface,
  TimerDial,
  formatSecondsAsTimeString,
  toast,
} from "~/shared/ui";
import styles from "./CurrentSession.module.css";

export type CurrentSessionProps = {
  daySeconds?: number;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
};

export function CurrentSession({
  daySeconds = 0,
  collapsed = false,
  onToggleCollapsed,
}: CurrentSessionProps) {
  const { t } = useTranslation();
  const {
    currentActivity,
    currentSession,
    status,
    displayedSeconds,
    start,
    pause,
    finish,
    isLoading,
  } = useCurrentActivity();
  const [pending, setPending] = useState(false);
  const settings = useQuery({
    queryKey: [ACTIVITY_SETTINGS_QUERY_KEY, currentActivity?.id],
    enabled: Boolean(currentActivity?.id),
    queryFn: () =>
      activityApiService.getActivitySettings({
        activityId: currentActivity!.id,
      }),
    select: (response) => (response.success ? response.data : undefined),
  });
  const goalSeconds =
    settings.data?.sessionGoalSeconds ??
    DEFAULT_ACTIVITY_SETTINGS.sessionGoalSeconds;
  const perform = async (action: () => Promise<unknown>) => {
    if (pending) return;
    setPending(true);
    try {
      await action();
    } catch {
      toast.error(t("pages.dashboard.actionError"));
    } finally {
      setPending(false);
    }
  };
  const statusText =
    status === "active"
      ? t("pages.dashboard.running")
      : status === "paused"
        ? t("pages.dashboard.paused")
        : t("pages.dashboard.ready");
  const displayedTime = formatSecondsAsTimeString(displayedSeconds);
  return (
    <Surface className={styles.panel}>
      <PanelHeading
        title={t("pages.dashboard.currentSession")}
        action={
          <div className={styles.actions}>
            <StatusBadge tone={status === "active" ? "mint" : "muted"}>
              {statusText}
            </StatusBadge>
            {onToggleCollapsed && (
              <ActionButton
                tone="ghost"
                compact
                aria-expanded={!collapsed}
                aria-label={t(
                  collapsed
                    ? "pages.home.expandStopwatch"
                    : "pages.home.collapseStopwatch",
                )}
                onClick={onToggleCollapsed}
              >
                <ChevronUpIcon
                  size={15}
                  style={{
                    transform: collapsed ? "rotate(180deg)" : undefined,
                  }}
                />
              </ActionButton>
            )}
          </div>
        }
      />
      {collapsed ? (
        <div className={styles.collapsed}>
          <span>
            {currentActivity?.title ?? t("pages.home.selectActivity")}
          </span>
          <strong role="timer">{displayedTime}</strong>
        </div>
      ) : (
        <TimerDial
          title={currentActivity?.title ?? t("pages.home.selectActivity")}
          time={displayedTime}
          label={t("pages.dashboard.elapsed")}
          caption={
            currentActivity
              ? t("pages.dashboard.goal", {
                  time: formatSecondsAsTimeString(goalSeconds),
                })
              : t("pages.dashboard.chooseHint")
          }
          progress={(daySeconds / goalSeconds) * 100}
        />
      )}
      <SessionControls
        running={status === "active"}
        disabled={!currentActivity || pending || isLoading}
        finishDisabled={
          !currentSession || !["active", "paused"].includes(status)
        }
        pending={pending}
        onToggle={() => void perform(status === "active" ? pause : start)}
        onFinish={() => void perform(finish)}
        playLabel={t("pages.dashboard.start")}
        pauseLabel={t("pages.dashboard.pause")}
        finishLabel={t("pages.dashboard.finish")}
      />
      {currentActivity && (
        <p className={styles.hint}>{t("pages.dashboard.focusCaption")}</p>
      )}
    </Surface>
  );
}
