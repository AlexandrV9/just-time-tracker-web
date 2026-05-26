import { streamSSE } from "hono/streaming";
import type { Context } from "hono";
import type { AuthVariables } from "../shared/auth/auth.variables.js";
import { activityEventsHub } from "./activityEvents.hub.js";

const HEARTBEAT_INTERVAL_MS = 25_000;

export const activityEventsHandlers = {
  stream: (c: Context<{ Variables: AuthVariables }>) => {
    const user = c.get("user");

    c.header("X-Accel-Buffering", "no");

    return streamSSE(c, async (stream) => {
      const unsubscribe = activityEventsHub.subscribe(user.id, async (event) => {
        await stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event),
        });
      });

      stream.onAbort(() => {
        unsubscribe();
      });

      while (!stream.aborted && !stream.closed) {
        await stream.writeSSE({ data: "", event: "ping" });
        await stream.sleep(HEARTBEAT_INTERVAL_MS);
      }
    });
  },
};
