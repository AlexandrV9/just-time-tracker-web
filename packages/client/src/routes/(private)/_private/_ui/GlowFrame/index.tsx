import { useLayoutEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";

import styles from "./GlowFrame.module.css";
import { Box } from "~/shared/ui";

const VIEWBOX_WIDTH = 280;
const VIEWBOX_HEIGHT = 180;
const CORNER_RADIUS_PX = 16;

type GlowFrameProps = {
  maxWidth?: number;
  minHeight?: number;
  active?: boolean;
  collapsed?: boolean;
  className?: string;
  children?: ReactNode;
};

export function GlowFrame({
  maxWidth = 360,
  minHeight = 100,
  active = false,
  collapsed = false,
  className,
  children,
}: GlowFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    el.style.setProperty("--glow-frame-max-width", `${maxWidth}px`);
    el.style.setProperty("--glow-frame-min-height", `${minHeight}px`);
  }, [maxWidth, minHeight]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const syncRadii = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      el.style.setProperty(
        "--glow-frame-rx",
        String((CORNER_RADIUS_PX * VIEWBOX_WIDTH) / width),
      );
      el.style.setProperty(
        "--glow-frame-ry",
        String((CORNER_RADIUS_PX * VIEWBOX_HEIGHT) / height),
      );
    };

    syncRadii();
    const observer = new ResizeObserver(syncRadii);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={rootRef}
      data-flip="frame"
      maxW="400px"
      className={clsx(
        styles.root,
        active && styles.active,
        collapsed && styles.collapsed,
        className,
      )}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
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
          x="0"
          y="0"
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          pathLength="100"
        />

        <rect
          className={styles.ring}
          x="0"
          y="0"
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          pathLength="100"
        />

        <rect
          className={styles.highlight}
          x="0"
          y="0"
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          pathLength="100"
        />
      </svg>
      {children && <div className={styles.content}>{children}</div>}
    </Box>
  );
}
