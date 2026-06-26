import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { Pool } from "pg";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetNotificationsTables,
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";
import {
  createNotificationWorker,
  MAX_NOTIFICATION_DELIVERY_LAG_MS,
  notificationsRepository,
  notificationsService,
  pushSubscriptionsRepository,
  setNotificationJobsChangeListener,
  type NotificationJob,
  type NotificationSender,
} from "../../src/modules/notifications/index.js";

const TEST_USER_ID = "11111111-1111-4111-8111-111111111111";

const seedUser = async (pool: Pool) => {
  await pool.query(
    `INSERT INTO users (id, login, password_hash, first_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (login) DO NOTHING`,
    [TEST_USER_ID, "notification-user", "hash", "Notification User"],
  );
};

const flushTimers = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 20);
  });

describe("notifications module", () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    await resetNotificationsTables(testDb.pool);
    await resetUsersTables(testDb.pool);
    await seedUser(testDb.pool);
    setNotificationJobsChangeListener(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    setNotificationJobsChangeListener(() => undefined);
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  it("schedules and cancels a pending notification job", async () => {
    const scheduled = await notificationsService.scheduleNotification({
      userId: TEST_USER_ID,
      type: "activity_goal_reached",
      title: "Goal reached",
      body: "You did it",
      sendAt: new Date(Date.now() + 60_000),
      payload: { activityId: "activity-1" },
    });

    expect(scheduled.success).toBe(true);
    if (!scheduled.success) return;

    expect(scheduled.data.status).toBe("pending");
    expect(scheduled.data.userId).toBe(TEST_USER_ID);
    expect(scheduled.data.payload).toEqual({ activityId: "activity-1" });

    const canceled = await notificationsService.cancelNotification({
      jobId: scheduled.data.id,
    });

    expect(canceled.success).toBe(true);
    if (!canceled.success) return;

    expect(canceled.data.status).toBe("canceled");
  });

  it("processes due jobs via worker and marks them as sent", async () => {
    const send = vi.fn(async (_job: NotificationJob) => undefined);
    const sender: NotificationSender = { send };

    const job = await notificationsRepository.createJob({
      userId: TEST_USER_ID,
      type: "admin_broadcast",
      title: "Hello",
      body: "World",
      sendAt: new Date(Date.now() - 1_000),
    });

    const worker = createNotificationWorker({
      fallbackPollIntervalMs: 60_000,
      batchSize: 10,
      sender,
    });

    await worker.tick();

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]?.id).toBe(job.id);

    const updated = await notificationsRepository.findById(job.id);
    expect(updated?.status).toBe("sent");
    expect(updated?.sentAt).not.toBeNull();

    worker.stop();
  });

  it("marks job as failed when sender throws", async () => {
    const sender: NotificationSender = {
      send: vi.fn(async () => {
        throw new Error("delivery failed");
      }),
    };

    const job = await notificationsRepository.createJob({
      userId: TEST_USER_ID,
      type: "activity_reminder",
      title: "Start activity",
      body: "Time to begin",
      sendAt: new Date(Date.now() - 1_000),
    });

    const worker = createNotificationWorker({ sender });
    await worker.tick();

    const updated = await notificationsRepository.findById(job.id);
    expect(updated?.status).toBe("failed");

    worker.stop();
  });

  it("returns the next pending send_at", async () => {
    await notificationsRepository.createJob({
      userId: TEST_USER_ID,
      type: "activity_goal_reached",
      title: "Later",
      body: "",
      sendAt: new Date(Date.now() + 60_000),
    });

    const earlier = await notificationsRepository.createJob({
      userId: TEST_USER_ID,
      type: "activity_long_pause",
      title: "Sooner",
      body: "",
      sendAt: new Date(Date.now() + 30_000),
    });

    const nextSendAt = await notificationsRepository.findNextPendingSendAt();

    expect(nextSendAt).toEqual(earlier.sendAt);
  });

  it("delivers overdue job immediately after reschedule wake", async () => {
    const send = vi.fn(async (_job: NotificationJob) => undefined);
    const sender: NotificationSender = { send };

    const job = await notificationsRepository.createJob({
      userId: TEST_USER_ID,
      type: "activity_goal_reached",
      title: "Overdue",
      body: "",
      sendAt: new Date(Date.now() - 1_000),
    });

    const worker = createNotificationWorker({
      sender,
      fallbackPollIntervalMs: 60_000,
    });

    await worker.reschedule();
    await flushTimers();

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]?.id).toBe(job.id);

    const updated = await notificationsRepository.findById(job.id);
    expect(updated?.status).toBe("sent");

    worker.stop();
  });

  it("delivers future job via wake timer within delivery lag window", async () => {
    const send = vi.fn(async (_job: NotificationJob) => undefined);
    const sender: NotificationSender = { send };

    const job = await notificationsRepository.createJob({
      userId: TEST_USER_ID,
      type: "activity_long_activity",
      title: "Future",
      body: "",
      sendAt: new Date(Date.now() + 300),
    });

    const worker = createNotificationWorker({
      sender,
      fallbackPollIntervalMs: 60_000,
    });

    await worker.reschedule();
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]?.id).toBe(job.id);

    const updated = await notificationsRepository.findById(job.id);
    expect(updated?.status).toBe("sent");

    worker.stop();
  });

  it("delivers future job when scheduleNotification triggers listener reschedule", async () => {
    const send = vi.fn(async (_job: NotificationJob) => undefined);
    const sender: NotificationSender = { send };

    const worker = createNotificationWorker({
      sender,
      fallbackPollIntervalMs: 60_000,
    });

    setNotificationJobsChangeListener(() => {
      void worker.reschedule();
    });

    const scheduled = await notificationsService.scheduleNotification({
      userId: TEST_USER_ID,
      type: "activity_goal_reached",
      title: "Scheduled",
      body: "",
      sendAt: new Date(Date.now() + 300),
    });

    expect(scheduled.success).toBe(true);
    if (!scheduled.success) return;

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]?.id).toBe(scheduled.data.id);

    const updated = await notificationsRepository.findById(scheduled.data.id);
    expect(updated?.status).toBe("sent");

    worker.stop();
  });

  it("delivers overdue job via fallback poll within lag window", async () => {
    const send = vi.fn(async (_job: NotificationJob) => undefined);
    const sender: NotificationSender = { send };

    const worker = createNotificationWorker({
      sender,
      fallbackPollIntervalMs: MAX_NOTIFICATION_DELIVERY_LAG_MS,
    });

    worker.start();

    await notificationsRepository.createJob({
      userId: TEST_USER_ID,
      type: "activity_long_pause",
      title: "Overdue after start",
      body: "",
      sendAt: new Date(Date.now() - 1_000),
    });

    await new Promise((resolve) =>
      setTimeout(resolve, MAX_NOTIFICATION_DELIVERY_LAG_MS + 200),
    );

    expect(send).toHaveBeenCalledTimes(1);

    worker.stop();
  });

  it("stores and updates push subscriptions by endpoint", async () => {
    const created = await pushSubscriptionsRepository.createSubscription({
      userId: TEST_USER_ID,
      endpoint: "https://push.example/subscription-1",
      p256dh: "p256dh-key",
      auth: "auth-secret",
    });

    expect(created.userId).toBe(TEST_USER_ID);

    const updated = await pushSubscriptionsRepository.createSubscription({
      userId: TEST_USER_ID,
      endpoint: "https://push.example/subscription-1",
      p256dh: "p256dh-key-2",
      auth: "auth-secret-2",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.p256dh).toBe("p256dh-key-2");

    const subscriptions =
      await pushSubscriptionsRepository.findByUserId(TEST_USER_ID);

    expect(subscriptions).toHaveLength(1);

    const deleted = await pushSubscriptionsRepository.deleteByEndpoint(
      "https://push.example/subscription-1",
    );

    expect(deleted).toBe(true);
  });
});
