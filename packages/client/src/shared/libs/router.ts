/** TanStack Router stores parsed search as an object — never concatenate it into a path string. */
export function buildLocationRedirectPath(location: {
  pathname: string;
  search: unknown;
  hash: string;
}): string | undefined {
  if (location.pathname === "/") return undefined;

  let searchPart = "";
  if (typeof location.search === "string") {
    if (location.search !== "") {
      searchPart = location.search.startsWith("?")
        ? location.search
        : `?${location.search}`;
    }
  } else if (location.search && typeof location.search === "object") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(
      location.search as Record<string, unknown>,
    )) {
      if (value == null || value === "") continue;
      params.set(key, String(value));
    }
    const qs = params.toString();
    if (qs) searchPart = `?${qs}`;
  }

  return `${location.pathname}${searchPart}${location.hash}`;
}
