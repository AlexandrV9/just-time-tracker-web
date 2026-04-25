import type { Context } from "hono";
import { activitySessionQueries } from "./activitySession.queries.js";

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

    return c.json({
      success: true,
      data: session,
    });
  },

  deleteById: async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Missing id" }, 400);
    }

    const session = await activitySessionQueries.getActivitySessionById(id);
    if (!session) {
      return c.json({ success: false, message: "Session not found" }, 404);
    }

    if (session.status === "active") {
      return c.json(
        { success: false, message: "Cannot delete active session" },
        409,
      );
    }

    const deleted = await activitySessionQueries.deleteActivitySessionById(id);
    if (!deleted) {
      return c.json({ success: false, message: "Session not found" }, 404);
    }

    return c.json({ success: true, data: true });
  },
};
