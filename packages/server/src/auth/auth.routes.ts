import { Hono } from "hono";
import { authHandlers } from "./auth.handlers.js";
import { passwordResetRouter } from "./passwordReset.routes.js";
import { yandexHandlers } from "./yandex.handlers.js";

export const authRouter = new Hono();

authRouter.get("/", authHandlers.init);
authRouter.post("/sign-in", authHandlers.signIn);
authRouter.post("/sign-up", authHandlers.signUp);
authRouter.post("/sign-out", authHandlers.signOut);
authRouter.get("/refresh", authHandlers.refresh);
authRouter.get("/check-refresh", authHandlers.checkRefresh);

// Password reset (public "forgot password" flow)
authRouter.route("/password-reset", passwordResetRouter);

// Yandex OAuth
// authRouter.get("/yandex", yandexHandlers.startLogin);
// authRouter.get("/yandex/callback", yandexHandlers.callback);
