import { zValidator } from "@hono/zod-validator";
import { validationUtils } from "../shared/index.js";

import { timeEntriesService } from "./timeEntry.service.js";
import {
  createTimeEntrySchema,
  updateTimeEntrySchema,
  getTimeEntriesQuerySchema,
  timeEntryIdSchema,
} from "@to-do-list/shared";

type ValidatorType = "json" | "param" | "query";

const createHandler = (
  type: ValidatorType,
  schema: any,
  serviceMethod: Function,
  successStatus = 200
) =>
  zValidator(type, schema, async (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validation failed",
          data: validationUtils.formatZodErrors(result.error.message),
        },
        400
      );
    }

    try {
      const responseData = await serviceMethod(result.data);

      let statusCode = successStatus;

      const status =
        responseData.success === false &&
        responseData.error?.code === "NOT_FOUND"
          ? 404
          : successStatus;

      return c.json(responseData, statusCode as any);
    } catch (error) {
      console.error("Handler error:", error);

      return c.json(
        {
          success: false,
          message: "Internal server error",
        },
        500
      );
    }
  });

export const timeEntryHandlers = {
  getTimeEntryById: createHandler(
    "param",
    timeEntryIdSchema,
    timeEntriesService.getTimeEntryById
  ),

  getTimeEntries: createHandler(
    "query",
    getTimeEntriesQuerySchema,
    timeEntriesService.getTimeEntries
  ),

  createTimeEntry: createHandler(
    "json",
    createTimeEntrySchema,
    timeEntriesService.createTimeEntry,
    201
  ),

  updateTimeEntry: createHandler(
    "json",
    updateTimeEntrySchema,
    timeEntriesService.updateTimeEntry
  ),

  deleteTimeEntry: createHandler(
    "param",
    timeEntryIdSchema,
    timeEntriesService.deleteTimeEntry
  ),
};
