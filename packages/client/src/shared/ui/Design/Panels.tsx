import type { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";
import { Box, type BoxProps } from "../Box";
import type { DesignTone } from "./types";
import styles from "./Design.module.css";

export function IconTile({
  tone = "purple",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: DesignTone }) {
  return (
    <span
      className={clsx(styles.iconTile, className)}
      data-tone={tone}
      {...props}
    />
  );
}

export function StatusBadge({
  children,
  tone = "purple",
  dot = true,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "purple" | "mint" | "muted";
  dot?: boolean;
}) {
  return (
    <span className={clsx(styles.badge, className)} data-tone={tone} {...props}>
      {dot && <i aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Surface({ className, ...props }: BoxProps) {
  return <Box className={clsx(styles.surface, className)} {...props} />;
}

export function PanelHeading({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.heading}>
      <h2>{title}</h2>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  tone = "purple",
  className,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: DesignTone;
  className?: string;
}) {
  return (
    <Surface className={clsx(styles.metric, className)}>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <IconTile tone={tone} aria-hidden="true">
        {icon}
      </IconTile>
    </Surface>
  );
}

export function FormSurface({ className, ...props }: BoxProps) {
  return <Surface className={clsx(styles.formSurface, className)} {...props} />;
}

export function DesignEmptyState({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}
