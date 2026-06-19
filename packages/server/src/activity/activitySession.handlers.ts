import { baseIdSchema } from "@time-tracker/shared";
import { createValidatedHandler } from "../shared/utils/request.js";
import { activitySessionService } from "./activitySession.service.js";

export const activitySessionHandlers = {
  getById: createValidatedHandler({
    parse: (c) => ({ id: c.req.param("id") }),
    schema: baseIdSchema,
    service: activitySessionService.getById,
  }),

  deleteById: createValidatedHandler({
    parse: (c) => ({ id: c.req.param("id") }),
    schema: baseIdSchema,
    service: activitySessionService.deleteById,
  }),
};
