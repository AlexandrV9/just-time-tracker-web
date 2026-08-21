export function pick<T, K extends keyof T>(
  items: readonly T[],
  key: K,
): T[K][] {
  return items.map((item) => item[key]);
}

export function getIds<T extends { id: string }>(
  items: readonly T[],
): string[] {
  return pick(items, "id");
}
