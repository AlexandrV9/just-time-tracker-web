import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { getClientIp, normalizeIp } from "./getClientIp.js";

describe("normalizeIp", () => {
  it("unwraps IPv4-mapped IPv6 addresses", () => {
    expect(normalizeIp("::ffff:192.168.1.1")).toBe("192.168.1.1");
  });
});

describe("getClientIp", () => {
  const createContext = (headers: Record<string, string>) => {
    const app = new Hono();
    let ip = "unknown";

    app.get("/test", (c) => {
      ip = getClientIp(c);
      return c.text("ok");
    });

    return {
      resolve: async () => {
        await app.request("/test", { headers });
        return ip;
      },
    };
  };

  it("prefers cf-connecting-ip", async () => {
    const ctx = createContext({
      "cf-connecting-ip": "203.0.113.1",
      "x-forwarded-for": "198.51.100.1",
    });
    await expect(ctx.resolve()).resolves.toBe("203.0.113.1");
  });

  it("uses the first x-forwarded-for address", async () => {
    const ctx = createContext({
      "x-forwarded-for": "203.0.113.2, 10.0.0.1",
    });
    await expect(ctx.resolve()).resolves.toBe("203.0.113.2");
  });

  it("falls back to x-real-ip", async () => {
    const ctx = createContext({
      "x-real-ip": "203.0.113.3",
    });
    await expect(ctx.resolve()).resolves.toBe("203.0.113.3");
  });
});
