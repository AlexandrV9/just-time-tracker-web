import { Hono } from "hono";
import type { AuthVariables } from "../../shared/auth/auth.variables.js";
import { pushSubscriptionsHandlers } from "./pushSubscriptions.handlers.js";

export const pushSubscriptionsRouter = new Hono<{ Variables: AuthVariables }>();

pushSubscriptionsRouter.put("/", pushSubscriptionsHandlers.upsertSubscription);
pushSubscriptionsRouter.delete(
  "/",
  pushSubscriptionsHandlers.deleteSubscription,
);
