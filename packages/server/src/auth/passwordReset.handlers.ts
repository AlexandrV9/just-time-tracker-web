import {
  confirmPasswordResetSchema,
  startPasswordResetSchema,
  verifyPasswordResetSchema,
} from "@to-do-list/shared";
import { resolveEmailLang } from "../shared/index.js";
import { createValidatedHandler } from "../shared/utils/request.js";
import { passwordResetService } from "./passwordReset.service.js";

const getStatus = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: startPasswordResetSchema,
  map: (data) => ({ email: data.email }),
  service: passwordResetService.getStatus,
});

const start = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: startPasswordResetSchema,
  map: (data, c) => ({
    email: data.email,
    lang: resolveEmailLang(c.req.header("accept-language")),
  }),
  service: passwordResetService.start,
});

const verify = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: verifyPasswordResetSchema,
  service: passwordResetService.verify,
});

const resend = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: startPasswordResetSchema,
  map: (data, c) => ({
    email: data.email,
    lang: resolveEmailLang(c.req.header("accept-language")),
  }),
  service: passwordResetService.resend,
});

const confirm = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: confirmPasswordResetSchema,
  service: passwordResetService.confirm,
});

export const passwordResetHandlers = {
  getStatus,
  start,
  verify,
  resend,
  confirm,
};
