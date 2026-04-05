import type { Context } from "hono";
import { activitySessionSegmentQueries } from "./activitySessionSegment.queries.js";

export const activitySessionSegmentsHandlers = {
  getById: async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }

    const segment = await activitySessionSegmentQueries.getSegmentById(id);

    if (!segment) {
      return c.json({ success: false, message: "Segment not found" }, 404);
    }

    return c.json({
      success: true,
      data: segment,
    });
  },
};
