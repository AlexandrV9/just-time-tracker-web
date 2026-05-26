import type { GetActivityDTO } from "@to-do-list/shared";
import { activitySessionSegmentQueries } from "./activitySessionSegment.queries.js";
import {
  handlerJson,
  type HandlerJsonResult,
} from "../shared/utils/request.js";

const getById = async (data: GetActivityDTO): Promise<HandlerJsonResult> => {
  const segment = await activitySessionSegmentQueries.getSegmentById(data.id);

  if (!segment) {
    return handlerJson({ success: false, message: "Segment not found" }, 404);
  }

  return handlerJson({ success: true, data: segment });
};

export const activitySessionSegmentService = {
  getById,
};
