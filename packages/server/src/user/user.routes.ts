import { Hono } from "hono";
import type { AuthVariables } from "../shared/auth/auth.variables.js";
import { userHandlers } from "./user.handlers.js";

export const usersRouter = new Hono<{ Variables: AuthVariables }>();

usersRouter.patch("/me", userHandlers.updateProfile);
usersRouter.patch("/me/locale", userHandlers.updateLocale);
usersRouter.patch("/me/push-notifications", userHandlers.updatePushNotifications);
usersRouter.post("/me/password", userHandlers.setPassword);
usersRouter.patch("/me/password", userHandlers.updatePassword);

usersRouter.get("/me/auth-providers", userHandlers.getAuthProviders);
usersRouter.delete("/me/auth-providers/:provider", userHandlers.unlinkProvider);
