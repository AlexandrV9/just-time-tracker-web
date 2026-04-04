import type { Context } from "hono";
import { activitySessionQueries } from "./activitySession.queries.js";
import { activitySessionSegmentQueries } from "./activitySessionSegment.queries.js";

export const activitySessionHandlers = {
  getById: async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }

    const session = await activitySessionQueries.getActivitySessionById(id);
    if (!session) {
      return c.json({ success: false, message: "Session not found" }, 404);
    }

    const segment =
      await activitySessionSegmentQueries.getSegmentBySessionId(id);

    return c.json({
      success: true,
      data: { session, segment },
    });
  },
};
