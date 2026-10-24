/**
 * Mirrors ActivityListView.module.css breakpoints.
 * <400 → 1 col, ≥400 → 2, ≥768 → 3, ≥1024 → 4
 */
export function getActivityGridColumns(viewportWidth: number): number {
  if (viewportWidth >= 1024) return 4;
  if (viewportWidth >= 768) return 3;
  if (viewportWidth >= 400) return 2;
  return 1;
}

/**
 * Mirrors ActivityCardViewSkeleton minH: clamp(7.5rem, 28vw, 10rem)
 */
export function getActivityCardHeightPx(
  viewportWidth: number,
  remPx = 16,
): number {
  return Math.min(10 * remPx, Math.max(7.5 * remPx, 0.28 * viewportWidth));
}

export type CalcActivitySkeletonCountParams = {
  /** Free vertical space for the grid (px), from list top to scroll-parent bottom. */
  availableHeight: number;
  viewportWidth: number;
  /** Root font-size in px. Defaults to 16. */
  remPx?: number;
  /** Grid gap — matches ActivityListView `gap: 0.75rem`. */
  gapRem?: number;
};

/**
 * How many activity card skeletons fit without causing vertical scroll.
 * Returns a multiple of the current column count (full rows only).
 */
export function calcActivitySkeletonCount({
  availableHeight,
  viewportWidth,
  remPx = 16,
  gapRem = 0.75,
}: CalcActivitySkeletonCountParams): number {
  const columns = getActivityGridColumns(viewportWidth);
  const gap = gapRem * remPx;
  const cardHeight = getActivityCardHeightPx(viewportWidth, remPx);

  if (availableHeight <= 0 || cardHeight <= 0) {
    return columns;
  }

  // (H + gap) / (card + gap) = how many rows fit when gaps sit between rows only.
  const rows = Math.floor((availableHeight + gap) / (cardHeight + gap));

  return Math.max(1, rows) * columns;
}
