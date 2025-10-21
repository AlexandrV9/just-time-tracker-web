import { Hono } from "hono";
import { authHandlers } from "./auth.handlers.js";

export const authRouter = new Hono();

authRouter.get("/", authHandlers.init);
authRouter.post("/sign-in", authHandlers.signIn);
authRouter.post("/sign-up", authHandlers.signUp);
authRouter.post("/sign-out", authHandlers.signOut);
authRouter.get("/check-refresh", authHandlers.checkRefresh)
