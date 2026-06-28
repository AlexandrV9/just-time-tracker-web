import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Hono } from "hono";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetNotificationsTables,
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";
import { pushSubscriptionsRouter } from "../../src/modules/notifications/pushSubscriptions.routes.js";
import type { AuthVariables } from "../../src/shared/auth/auth.variables.js";

type JsonBody = Record<string, unknown>;

const json = async (res: Response): Promise<JsonBody> =>
  (await res.json()) as JsonBody;

const TEST_USER_ID = "11111111-1111-4111-8111-111111111111";

describe("pushSubscriptionsRouter", () => {
  let testDb: TestDatabase;
  let testRouter: Hono<{ Variables: AuthVariables }>;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    await resetNotificationsTables(testDb.pool);
    await resetUsersTables(testDb.pool);

    await testDb.pool.query(
      `INSERT INTO users (id, login, password_hash, first_name)
       VALUES ($1, $2, $3, $4)`,
      [TEST_USER_ID, "push-user", "hash", "Push User"],
    );

    testRouter = new Hono<{ Variables: AuthVariables }>();
    testRouter.use("*", async (c, next) => {
      c.set("user", { id: TEST_USER_ID });
      await next();
    });
    testRouter.route("/", pushSubscriptionsRouter);
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  it("upserts a push subscription", async () => {
    const res = await testRouter.request("/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: "https://push.example/subscription-1",
        keys: {
          p256dh: "p256dh-key",
          auth: "auth-secret",
        },
      }),
    });
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect((body.data as { endpoint: string }).endpoint).toBe(
      "https://push.example/subscription-1",
    );
  });

  it("deletes a push subscription by endpoint", async () => {
    await testRouter.request("/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: "https://push.example/subscription-1",
        keys: {
          p256dh: "p256dh-key",
          auth: "auth-secret",
        },
      }),
    });

    const res = await testRouter.request("/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: "https://push.example/subscription-1",
      }),
    });
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
