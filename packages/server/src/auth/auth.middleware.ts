import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import type { AuthJWTPayload } from "../shared/auth/auth.types.js";
import type { AuthVariables } from "../shared/auth/auth.variables.js";
import { config, isUuid } from "../shared/index.js";

export const authMiddleware: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (c, next) => {
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

    const userId = String(payload.data.id);

    if (!isUuid(userId)) {
      return c.json({ message: "Invalid token" }, 401);
    }

    c.set("user", {
      id: userId,
    });

    await next();
  } catch {
    return c.json({ message: "Invalid token" }, 401);
  }
};
