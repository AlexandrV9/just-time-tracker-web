import {
  confirmPasswordResetSchema,
  startPasswordResetSchema,
  verifyPasswordResetSchema,
} from "@to-do-list/shared";
import { createValidatedHandler } from "../shared/utils/request.js";
import { passwordResetService } from "./passwordReset.service.js";

const start = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: startPasswordResetSchema,
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
  service: passwordResetService.resend,
});

const confirm = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: confirmPasswordResetSchema,
  service: passwordResetService.confirm,
});

export const passwordResetHandlers = {
  start,
  verify,
  resend,
  confirm,
};
