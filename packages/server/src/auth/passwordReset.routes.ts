import { Hono } from "hono";
import { passwordResetHandlers } from "./passwordReset.handlers.js";

export const passwordResetRouter = new Hono();

passwordResetRouter.post("/status", passwordResetHandlers.getStatus);
passwordResetRouter.post("/start", passwordResetHandlers.start);
passwordResetRouter.post("/verify", passwordResetHandlers.verify);
passwordResetRouter.post("/resend", passwordResetHandlers.resend);
passwordResetRouter.post("/confirm", passwordResetHandlers.confirm);
