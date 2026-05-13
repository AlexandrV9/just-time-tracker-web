import { useEffect } from "react";

type UseScrollToAnchorParams = {
  containerRef: React.RefObject<HTMLElement | null>;
  targetRef: React.RefObject<HTMLElement | null>;
  anchor?: number;
  behavior?: ScrollBehavior;
  /** When this identity changes, scroll position is recomputed (e.g. `hourHeight`). */
  revalidateKey?: unknown;
};

export const useScrollToAnchor = ({
  containerRef,
  targetRef,
  anchor = 0.5,
  behavior = "auto",
  revalidateKey,
}: UseScrollToAnchorParams) => {
  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;

    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const containerHeight = container.clientHeight;

    const targetRect = target.getBoundingClientRect();
    const targetHeight = targetRect.height;

    const targetTop = targetRect.top - containerRect.top + container.scrollTop;
    const scrollTo = targetTop - containerHeight * anchor + targetHeight / 2;

    container.scrollTo({
      top: Math.max(0, scrollTo),
      behavior,
    });
  }, [anchor, behavior, containerRef, targetRef, revalidateKey]);
};
