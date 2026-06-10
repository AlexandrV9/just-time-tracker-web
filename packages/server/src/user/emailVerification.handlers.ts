import {
  confirmEmailVerificationSchema,
  startEmailVerificationSchema,
} from "@to-do-list/shared";
import type { Context } from "hono";
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
  const result = await emailVerificationService.resend({ userId });
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
