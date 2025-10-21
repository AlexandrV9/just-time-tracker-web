import { Hono } from "hono";
import { testConnection } from "../shared/db/utils.js";

export const healthRouter = new Hono();

healthRouter.get("/", async (c) => {
  const status = await testConnection();

  if (status.success) {
    return c.json({ status: "OK", ...status }, 200);
  } else {
    return c.json({ status: "ERROR", ...status }, 503);
  }
});
