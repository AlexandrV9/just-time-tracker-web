import { useId } from "react";
import { ActionButton } from "./ActionButton";
import { PauseIcon } from "../icons/Pause";
import { PlayIcon } from "../icons/Play";
import { StopIcon } from "../icons/Stop";
import styles from "./Design.module.css";

export function TimerDial({
  title,
  time,
  caption,
  label,
  progress = 0,
  compact = false,
}: {
  title: string;
  time: string;
  caption?: string;
  label: string;
  progress?: number;
  compact?: boolean;
}) {
  const gradientId = useId().replace(/:/g, "");
  return (
    <div className={styles.dial} data-compact={compact}>
      <svg className={styles.dialRing} viewBox="0 0 250 250" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId}>
            <stop stopColor="var(--design-purple)" />
            <stop offset="1" stopColor="var(--design-lavender)" />
          </linearGradient>
        </defs>
        <circle cx="125" cy="125" r="111" className={styles.dialTrack} />
        <circle
          cx="125"
          cy="125"
          r="111"
          className={styles.dialProgress}
          stroke={`url(#${gradientId})`}
          pathLength="100"
          strokeDasharray={`${Math.max(0, Math.min(100, progress))} 100`}
        />
      </svg>
      <div className={styles.dialCenter}>
        <span title={title}>{title}</span>
        <strong role="timer" aria-label={label}>
          {time}
        </strong>
        {caption && <small>{caption}</small>}
      </div>
    </div>
  );
}

export function SessionControls({
  running,
  disabled,
  finishDisabled,
  pending,
  onToggle,
  onFinish,
  playLabel,
  pauseLabel,
  finishLabel,
}: {
  running: boolean;
  disabled?: boolean;
  finishDisabled?: boolean;
  pending?: boolean;
  onToggle: () => void;
  onFinish: () => void;
  playLabel: string;
  pauseLabel: string;
  finishLabel: string;
}) {
  return (
    <div className={styles.controls}>
      <ActionButton
        onClick={onToggle}
        disabled={disabled}
        loading={pending}
        aria-pressed={running}
      >
        {running ? (
          <PauseIcon size={17} aria-hidden="true" />
        ) : (
          <PlayIcon size={17} aria-hidden="true" />
        )}
        {running ? pauseLabel : playLabel}
      </ActionButton>
      <ActionButton
        tone="subtle"
        onClick={onFinish}
        disabled={finishDisabled || pending}
        aria-label={finishLabel}
      >
        <StopIcon size={19} aria-hidden="true" />
      </ActionButton>
    </div>
  );
}
