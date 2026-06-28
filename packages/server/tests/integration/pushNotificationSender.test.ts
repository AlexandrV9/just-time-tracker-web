import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetNotificationsTables,
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";

const TEST_USER_ID = "11111111-1111-4111-8111-111111111111";

const sendNotification = vi.fn<
  (subscription: unknown, payload: string) => Promise<void>
>(async () => undefined);

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification,
  },
}));

vi.mock("../../src/shared/config/index.js", () => ({
  config: {
    push: { enabled: true },
    vapid: {
      subject: "mailto:test@localhost",
      publicKey: "test-public-key",
      privateKey: "test-private-key",
    },
    clientUrl: "http://localhost:3000",
  },
}));

describe("PushNotificationSender", () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    sendNotification.mockClear();
    await resetNotificationsTables(testDb.pool);
    await resetUsersTables(testDb.pool);

    await testDb.pool.query(
      `INSERT INTO users (id, login, password_hash, first_name, locale, push_notifications_enabled)
       VALUES ($1, $2, $3, $4, 'en', true)`,
      [TEST_USER_ID, "push-user", "hash", "Push User"],
    );

    await testDb.pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)`,
      [
        TEST_USER_ID,
        "https://push.example/subscription-1",
        "p256dh-key",
        "auth-secret",
      ],
    );
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  it("sends push even when user has active SSE subscribers", async () => {
    const { activityEventsHub } =
      await import("../../src/activity/activityEvents.hub.js");
    const { PushNotificationSender } =
      await import("../../src/modules/notifications/pushNotificationSender.js");

    const unsubscribe = activityEventsHub.subscribe(
      TEST_USER_ID,
      () => undefined,
    );
    const sender = new PushNotificationSender();

    await sender.send({
      id: "job-1",
      userId: TEST_USER_ID,
      activityId: null,
      type: "activity_goal_reached",
      title: "Goal",
      body: "",
      payload: null,
      sendAt: new Date().toISOString(),
      status: "pending",
      sentAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(sendNotification).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("skips push when user disabled push notifications", async () => {
    await testDb.pool.query(
      `UPDATE users SET push_notifications_enabled = false WHERE id = $1`,
      [TEST_USER_ID],
    );

    const { PushNotificationSender } =
      await import("../../src/modules/notifications/pushNotificationSender.js");
    const sender = new PushNotificationSender();

    await sender.send({
      id: "job-2",
      userId: TEST_USER_ID,
      activityId: null,
      type: "activity_goal_reached",
      title: "Goal",
      body: "",
      payload: null,
      sendAt: new Date().toISOString(),
      status: "pending",
      sentAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("sends localized push payload when SSE is offline", async () => {
    const { PushNotificationSender } =
      await import("../../src/modules/notifications/pushNotificationSender.js");
    const sender = new PushNotificationSender();

    await sender.send({
      id: "job-3",
      userId: TEST_USER_ID,
      activityId: "activity-1",
      type: "activity_goal_reached",
      title: "Reading",
      body: "",
      payload: { sessionId: "session-1" },
      sendAt: new Date().toISOString(),
      status: "pending",
      sentAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(sendNotification).toHaveBeenCalledTimes(1);

    const [, payloadJson] = sendNotification.mock.calls[0]!;
    const payload = JSON.parse(payloadJson);
    expect(payload.title).toBe("🎉 Goal reached");
    expect(payload.body).toContain("Reading");
    expect(payload.tag).toBe("reminder:job-3:activity_goal_reached");
    expect(payload.url).toBe("/activities/activity-1");
  });
});
