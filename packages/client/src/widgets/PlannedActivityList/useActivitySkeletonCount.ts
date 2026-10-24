import { useLayoutEffect, useState, type RefObject } from "react";
import { calcActivitySkeletonCount } from "./calcActivitySkeletonCount";

function getRemPx(): number {
  if (typeof document === "undefined") return 16;
  return (
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  );
}

function getAvailableHeight(el: HTMLElement): number {
  const scrollParent =
    (el.closest("main") as HTMLElement | null) ?? document.documentElement;
  const parentBottom = scrollParent.getBoundingClientRect().bottom;
  const top = el.getBoundingClientRect().top;
  // 1px slack against subpixel overflow / scrollbar-gutter.
  return Math.max(0, parentBottom - top - 1);
}

/**
 * Observes `containerRef` and returns skeleton count that fills free space
 * without vertical scroll. Column count follows ActivityListView breakpoints.
 */
export function useActivitySkeletonCount(
  containerRef: RefObject<HTMLElement | null>,
): number {
  const [count, setCount] = useState(() =>
    calcActivitySkeletonCount({
      availableHeight: 0,
      viewportWidth: typeof window !== "undefined" ? window.innerWidth : 400,
    }),
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setCount(
        calcActivitySkeletonCount({
          availableHeight: getAvailableHeight(el),
          viewportWidth: window.innerWidth,
          remPx: getRemPx(),
        }),
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    const main = el.closest("main");
    if (main) observer.observe(main);

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [containerRef]);

  return count;
}
