import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import type { AuthJWTPayload } from "src/shared/auth/auth.types.js";
import { config } from "src/shared/index.js";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const payload = (await verify(
      token,
      config.auth.accessToken.secret
    )) as AuthJWTPayload;

    c.set("user", {
      id: payload.data,
    });

    await next();
  } catch {
    return c.json({ message: "Invalid token" }, 401);
  }
};
