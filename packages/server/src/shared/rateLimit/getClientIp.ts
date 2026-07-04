import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";

export const normalizeIp = (address: string): string => {
  const trimmed = address.trim();
  if (trimmed.startsWith("::ffff:")) {
    return trimmed.slice("::ffff:".length);
  }
  return trimmed;
};

export const getClientIp = (c: Context): string => {
  const cfConnectingIp = c.req.header("cf-connecting-ip")?.trim();
  if (cfConnectingIp) {
    return normalizeIp(cfConnectingIp);
  }

  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return normalizeIp(first);
    }
  }

  const realIp = c.req.header("x-real-ip")?.trim();
  if (realIp) {
    return normalizeIp(realIp);
  }

  try {
    const { remote } = getConnInfo(c);
    if (remote.address) {
      return normalizeIp(remote.address);
    }
  } catch {
    // Non-Node adapter or missing bindings in tests.
  }

  return "unknown";
};
