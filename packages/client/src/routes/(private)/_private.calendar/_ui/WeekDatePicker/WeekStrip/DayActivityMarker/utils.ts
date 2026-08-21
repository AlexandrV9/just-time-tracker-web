/** Максимум точек в ячейке дня; дальше вместо них показываем число. */
export const MAX_VISIBLE_DOTS = 4;

export const getVisibleDotCount = (count: number) =>
  Math.max(0, Math.min(count, MAX_VISIBLE_DOTS));

export const shouldShowActivityCountBadge = (count: number) =>
  count > MAX_VISIBLE_DOTS;
