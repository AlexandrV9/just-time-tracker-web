import styles from "./Design.module.css";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={styles.brand} data-compact={compact}>
      <img src="/icons/logo.svg" alt="" width={33} height={33} />
      <span>
        Just Time<small> Tracker</small>
      </span>
    </span>
  );
}
