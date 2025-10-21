import { Hono } from "hono";

export const tasksRouter = new Hono();

tasksRouter.get("/", (c) => {
  return c.json({ success: true, data: [] });
});
