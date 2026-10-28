import type { ReactNode } from "react";
import type { DesignTone } from "./types";
import styles from "./Design.module.css";

export function ActivityRow({
  title,
  time,
  selected,
  tone = "purple",
  disabled,
  onSelect,
  actions,
}: {
  title: string;
  time?: string;
  selected?: boolean;
  tone?: DesignTone;
  disabled?: boolean;
  onSelect?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.row} data-selected={selected} data-tone={tone}>
      <button
        type="button"
        className={styles.rowBody}
        disabled={disabled}
        aria-pressed={selected}
        onClick={onSelect}
      >
        <i aria-hidden="true" />
        <span className={styles.rowTitle}>{title}</span>
        {time && <small>{time}</small>}
      </button>
      {actions && <div className={styles.rowActions}>{actions}</div>}
    </div>
  );
}
