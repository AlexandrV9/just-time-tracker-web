import { useDisplayedSessionSeconds } from "~/features/activity";
import { useTranslation } from "~/shared/hooks";
import type { ActivityState } from "~/shared/api/services";
import {
  ActionButton,
  ActivityRow,
  PauseIcon,
  PlayIcon,
  StopIcon,
  formatSecondsAsTimeString,
} from "~/shared/ui";

export function TodayActivityRow({
  row,
  selected,
  blocked,
  onSelect,
  onStart,
  onPause,
  onFinish,
  index,
}: {
  row: ActivityState;
  selected: boolean;
  blocked: boolean;
  index: number;
  onSelect: () => void;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const { activity, session, segment } = row;
  const displayedSeconds = useDisplayedSessionSeconds({
    session: session ?? null,
    segment: segment ?? null,
  });
  const running = session?.status === "active";
  const unfinished = running || session?.status === "paused";
  return (
    <ActivityRow
      title={activity.title}
      time={formatSecondsAsTimeString(
        session
          ? displayedSeconds
          : Math.floor(activity.activeDurationMs / 1000),
      )}
      selected={selected}
      tone={index % 3 === 1 ? "mint" : index % 3 === 2 ? "blue" : "purple"}
      disabled={blocked}
      onSelect={onSelect}
      actions={
        <>
          {unfinished && (
            <ActionButton
              tone="ghost"
              compact
              aria-label={`${t("pages.dashboard.finish")}: ${activity.title}`}
              onClick={onFinish}
            >
              <StopIcon size={16} aria-hidden="true" />
            </ActionButton>
          )}
          <ActionButton
            tone="ghost"
            compact
            disabled={blocked}
            aria-label={`${t(running ? "pages.dashboard.pause" : "pages.dashboard.start")}: ${activity.title}`}
            onClick={running ? onPause : onStart}
          >
            {running ? (
              <PauseIcon size={16} aria-hidden="true" />
            ) : (
              <PlayIcon size={16} aria-hidden="true" />
            )}
          </ActionButton>
        </>
      }
    />
  );
}
