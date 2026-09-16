import type { ReactNode } from "react";
import clsx from "clsx";

import styles from "./GlowFrame.module.css";

type GlowFrameProps = {
  width?: number;
  height?: number;
  active?: boolean;
  className?: string;
  children?: ReactNode;
};

export function GlowFrame({
  width = 400,
  height = 260,
  active = false,
  className,
  children,
}: GlowFrameProps) {
  return (
    <div
      className={clsx(styles.root, active && styles.active, className)}
      style={
        {
          "--glow-frame-width": `${width}px`,
          "--glow-frame-height": `${height}px`,
        } as React.CSSProperties
      }
    >
      <svg
        className={styles.svg}
        viewBox="0 0 280 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="glow-frame-gradient"
            x1="25"
            y1="30"
            x2="250"
            y2="150"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7567ff" />
            <stop offset="25%" stopColor="#7064ff" />
            <stop offset="48%" stopColor="#29c4ed" />
            <stop offset="67%" stopColor="#3479ff" />
            <stop offset="82%" stopColor="#6a45ff" />
            <stop offset="100%" stopColor="#d36cff" />
          </linearGradient>

          <linearGradient
            id="glow-frame-highlight"
            x1="20"
            y1="160"
            x2="260"
            y2="20"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ff8cff" />
            <stop offset="20%" stopColor="#925cff" />
            <stop offset="55%" stopColor="#566cff" />
            <stop offset="100%" stopColor="#45d9ff" />
          </linearGradient>
        </defs>

        <rect
          className={styles.glow}
          x="12"
          y="12"
          width="256"
          height="156"
          rx="22"
          ry="22"
          pathLength="100"
        />

        <rect
          className={styles.ring}
          x="12"
          y="12"
          width="256"
          height="156"
          rx="22"
          ry="22"
          pathLength="100"
        />

        <rect
          className={styles.highlight}
          x="12"
          y="12"
          width="256"
          height="156"
          rx="22"
          ry="22"
          pathLength="100"
        />
      </svg>
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}
