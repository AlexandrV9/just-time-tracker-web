/** node-pg returns TIMESTAMPTZ as `Date`; stringify for JSON must be ISO 8601, not `Date#toString()`. */
export function pgTimestampToIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === "string" && value.length > 0) {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) {
      return new Date(ms).toISOString();
    }
  }
  return String(value ?? "");
}

export function pgTimestampToIsoStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return pgTimestampToIsoString(value);
}
