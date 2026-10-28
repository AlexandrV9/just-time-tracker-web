import type { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Design.module.css";

export function OrbitDecoration({
  className,
  children,
  animated = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { animated?: boolean }) {
  return (
    <div
      className={clsx(styles.orbitDecoration, className)}
      aria-hidden="true"
      data-animated={animated}
      {...props}
    >
      <i />
      <i />
      <i />
      {children && <span>{children}</span>}
    </div>
  );
}
