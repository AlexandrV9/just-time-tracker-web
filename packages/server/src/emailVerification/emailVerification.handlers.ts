import {
  confirmEmailVerificationSchema,
  startEmailVerificationSchema,
} from "@time-tracker/shared";
import type { Context } from "hono";
import { resolveEmailLang } from "../shared/index.js";
import type { AuthVariables } from "../shared/auth/auth.variables.js";
import { getAuthenticatedUserId } from "../shared/auth/with-created-by-id.js";
import { createValidatedHandler } from "../shared/utils/request.js";
import { emailVerificationService } from "./emailVerification.service.js";

const getStatus = async (c: Context<{ Variables: AuthVariables }>) => {
  const userId = getAuthenticatedUserId(c);
  const result = await emailVerificationService.getStatus({ userId });
  return c.json(result);
};

const resend = async (c: Context<{ Variables: AuthVariables }>) => {
  const userId = getAuthenticatedUserId(c);
  const lang = resolveEmailLang(c.req.header("accept-language"));
  const result = await emailVerificationService.resend({ userId, lang });
  return c.json(result);
};

const cancel = async (c: Context<{ Variables: AuthVariables }>) => {
  const userId = getAuthenticatedUserId(c);
  const result = await emailVerificationService.cancel({ userId });
  return c.json(result);
};

const start = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: startEmailVerificationSchema,
  map: (data, c) => ({
    userId: getAuthenticatedUserId(c),
    email: data.email,
    lang: resolveEmailLang(c.req.header("accept-language")),
  }),
  service: emailVerificationService.start,
});

const confirm = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: confirmEmailVerificationSchema,
  map: (data, c) => ({
    userId: getAuthenticatedUserId(c),
    code: data.code,
  }),
  service: emailVerificationService.confirm,
});

export const emailVerificationHandlers = {
  getStatus,
  start,
  confirm,
  resend,
  cancel,
};
