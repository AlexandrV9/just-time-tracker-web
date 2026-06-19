import { baseIdSchema } from "@time-tracker/shared";
import { createValidatedHandler } from "../shared/utils/request.js";
import { activitySessionSegmentService } from "./activitySessionSegment.service.js";

export const activitySessionSegmentsHandlers = {
  getById: createValidatedHandler({
    parse: (c) => ({ id: c.req.param("id") }),
    schema: baseIdSchema,
    service: activitySessionSegmentService.getById,
  }),
};
