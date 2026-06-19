import type { GetActivityDTO } from "@time-tracker/shared";
import { activitySessionQueries } from "./activitySession.queries.js";
import {
  handlerJson,
  type HandlerJsonResult,
} from "../shared/utils/request.js";

const getById = async (data: GetActivityDTO): Promise<HandlerJsonResult> => {
  const session = await activitySessionQueries.getActivitySessionById(data.id);

  if (!session) {
    return handlerJson({ success: false, message: "Session not found" }, 404);
  }

  return handlerJson({ success: true, data: session });
};

const deleteById = async (data: GetActivityDTO): Promise<HandlerJsonResult> => {
  const session = await activitySessionQueries.getActivitySessionById(data.id);

  if (!session) {
    return handlerJson({ success: false, message: "Session not found" }, 404);
  }

  if (session.status === "active") {
    return handlerJson(
      { success: false, message: "Cannot delete active session" },
      409,
    );
  }

  const deleted = await activitySessionQueries.deleteActivitySessionById(
    data.id,
  );

  if (!deleted) {
    return handlerJson({ success: false, message: "Session not found" }, 404);
  }

  return handlerJson({ success: true, data: true });
};

export const activitySessionService = {
  getById,
  deleteById,
};
