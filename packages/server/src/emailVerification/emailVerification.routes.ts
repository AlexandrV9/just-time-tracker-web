import { Hono } from "hono";
import type { AuthVariables } from "../shared/auth/auth.variables.js";
import { emailVerificationHandlers } from "./emailVerification.handlers.js";

export const emailVerificationRouter = new Hono<{ Variables: AuthVariables }>();

emailVerificationRouter.get("/status", emailVerificationHandlers.getStatus);
emailVerificationRouter.post("/start", emailVerificationHandlers.start);
emailVerificationRouter.post("/confirm", emailVerificationHandlers.confirm);
emailVerificationRouter.post("/resend", emailVerificationHandlers.resend);
emailVerificationRouter.post("/cancel", emailVerificationHandlers.cancel);
