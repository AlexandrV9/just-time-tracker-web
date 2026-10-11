import type { MiddlewareHandler } from "hono";
import type { AuthVariables } from "shared/auth/auth.variables.js";
import { isUuid } from "shared/index.js";
import type { IJwtAuthTokenManager } from "../domain/index.js";

/**
 * Bearer access JWT → c.set("user", { id }).
 */
export const createAuthMiddleware = (
  jwtAuthTokenManager: IJwtAuthTokenManager,
): MiddlewareHandler<{ Variables: AuthVariables }> => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const token = jwtAuthTokenManager.extractTokenFromAuthHeader(authHeader);
    if (!token) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const verified = await jwtAuthTokenManager.verifyAccessToken(token);
    if (!verified.success) {
      return c.json({ message: "Invalid token" }, 401);
    }

    const userId = String(verified.payload.data.id);
    if (!isUuid(userId)) {
      return c.json({ message: "Invalid token" }, 401);
    }

    c.set("user", { id: userId });
    await next();
  };
};
