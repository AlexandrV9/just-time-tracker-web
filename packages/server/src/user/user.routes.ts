import { Hono } from "hono";
import type { AuthVariables } from "../shared/auth/auth.variables.js";
import { userHandlers } from "./user.handlers.js";

export const usersRouter = new Hono<{ Variables: AuthVariables }>();

usersRouter.patch("/me", userHandlers.updateProfile);
usersRouter.get("/me/auth-providers", userHandlers.getAuthProviders);
