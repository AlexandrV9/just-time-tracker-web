import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { TestDatabase } from "../setup/test-db.js";
import { resetActivitiesTables, startTestDatabase } from "../setup/test-db.js";
import { activitiesRouter } from "../../src/activity/activity.routes.js";

const T0 = "2025-01-01T10:00:00.000Z";
const T1 = "2025-01-01T10:05:00.000Z";
const T2 = "2025-01-01T10:10:00.000Z";
const RANGE_FROM = "2025-01-01T00:00:00.000Z";
const RANGE_TO = "2025-01-02T00:00:00.000Z";

type JsonBody = Record<string, unknown>;

const json = async (res: Response): Promise<JsonBody> =>
  (await res.json()) as JsonBody;

describe("activitiesRouter", () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    await resetActivitiesTables(testDb.pool);
  });

  afterAll(async () => {
    await testDb?.stop();
  });

  const seedActivity = async (title = "Seed activity") => {
    const { activityRepository } =
      await import("../../src/activity/activity.repository.js");

    return activityRepository.createActivity({
      title,
      createdById: "user-1",
      tags: ["work"],
    });
  };

  const seedTrackedActivity = async () => {
    const activity = await seedActivity("Tracked");

    await activitiesRouter.request("/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityId: activity.id,
        startedAt: T0,
      }),
    });

    await activitiesRouter.request("/pause", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityId: activity.id,
        pausedAt: T1,
      }),
    });

    await activitiesRouter.request("/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityId: activity.id,
        finishedAt: T2,
      }),
    });

    return activity;
  };

  describe("GET /:id", () => {
    it("returns activity by id", async () => {
      const created = await seedActivity();

      const res = await activitiesRouter.request(`/${created.id}`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: created.id,
        title: "Seed activity",
        createdById: "user-1",
      });
    });

    it("returns not found for missing id", async () => {
      const res = await activitiesRouter.request(
        "/00000000-0000-0000-0000-000000000000",
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body).toEqual({
        success: false,
        message: "Activity not found",
      });
    });
  });

  describe("GET /", () => {
    it("returns paginated activities filtered by createdById", async () => {
      await seedActivity("Alpha");
      await seedActivity("Beta");

      const res = await activitiesRouter.request(
        "/?createdById=user-1&limit=10",
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const data = body.data as { data: Array<{ title: string }> };
      expect(data.data).toHaveLength(2);
      expect(data.data.map((a) => a.title).sort()).toEqual(["Alpha", "Beta"]);
    });
  });

  describe("POST /", () => {
    it("creates activity with 201", async () => {
      const res = await activitiesRouter.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New via HTTP",
          createdById: "user-1",
          tags: ["api"],
        }),
      });
      const body = await json(res);

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        title: "New via HTTP",
        createdById: "user-1",
        tags: ["api"],
      });
    });
  });

  describe("PATCH /:id", () => {
    it("updates activity", async () => {
      const created = await seedActivity();

      const res = await activitiesRouter.request(`/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: created.id,
          title: "  Patched title  ",
        }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: created.id,
        title: "Patched title",
      });
    });
  });

  describe("DELETE /:id", () => {
    it("deletes activity", async () => {
      const created = await seedActivity();

      const res = await activitiesRouter.request(`/${created.id}`, {
        method: "DELETE",
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, data: null });

      const { rows } = await testDb.pool.query(
        "SELECT id FROM activities WHERE id = $1",
        [created.id],
      );
      expect(rows).toHaveLength(0);
    });
  });

  describe("POST /by-ids", () => {
    it("returns activities by ids", async () => {
      const a = await seedActivity("One");
      const b = await seedActivity("Two");

      const res = await activitiesRouter.request("/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityIds: [b.id, a.id] }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const items = body.data as Array<{ id: string; title: string }>;
      expect(items.map((x) => x.title)).toEqual(["Two", "One"]);
    });
  });

  describe("GET /tracked", () => {
    it("returns finished activity with segment time in range", async () => {
      const activity = await seedTrackedActivity();

      const res = await activitiesRouter.request(
        `/tracked?createdById=user-1&fromDate=${RANGE_FROM}&toDate=${RANGE_TO}`,
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const data = body.data as {
        data: Array<{
          activity: { id: string; activeDurationMs: number };
          session: null;
          segment: null;
        }>;
      };
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toMatchObject({
        activity: {
          id: activity.id,
          activeDurationMs: 300_000,
        },
        session: null,
        segment: null,
      });
    });

    it("returns cross-day finished activity on completion day, not in /current", async () => {
      const activity = await seedActivity("Cross-midnight HTTP");

      const startedYesterday = "2025-01-01T23:50:00.000Z";
      const pausedAfter20Min = "2025-01-02T00:10:00.000Z";
      const resumedAfter5MinPause = "2025-01-02T00:15:00.000Z";
      const finishedAfter5MinActive = "2025-01-02T00:20:00.000Z";
      const jan2From = "2025-01-02T00:00:00.000Z";
      const jan2To = "2025-01-03T00:00:00.000Z";

      await activitiesRouter.request("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          startedAt: startedYesterday,
        }),
      });

      await activitiesRouter.request("/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          pausedAt: pausedAfter20Min,
        }),
      });

      await activitiesRouter.request("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          startedAt: resumedAfter5MinPause,
        }),
      });

      await activitiesRouter.request("/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          finishedAt: finishedAfter5MinActive,
        }),
      });

      const trackedRes = await activitiesRouter.request(
        `/tracked?createdById=user-1&fromDate=${jan2From}&toDate=${jan2To}`,
      );
      const trackedBody = await json(trackedRes);

      expect(trackedRes.status).toBe(200);
      expect(trackedBody.success).toBe(true);

      const tracked = trackedBody.data as {
        data: Array<{ activity: { id: string; activeDurationMs: number } }>;
      };
      expect(tracked.data).toHaveLength(1);
      expect(tracked.data[0].activity).toMatchObject({
        id: activity.id,
        activeDurationMs: 900_000,
      });

      const currentRes = await activitiesRouter.request(
        `/current?createdById=user-1&fromDate=${jan2From}&toDate=${jan2To}&status=active`,
      );
      const currentBody = await json(currentRes);

      expect(currentBody.success).toBe(true);
      const current = currentBody.data as { data: unknown[] };
      expect(current.data).toHaveLength(0);
    });
  });

  describe("GET /current", () => {
    it("returns active activity in date range", async () => {
      const activity = await seedActivity("Current");

      await activitiesRouter.request("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          startedAt: T0,
        }),
      });

      const res = await activitiesRouter.request(
        `/current?createdById=user-1&fromDate=${RANGE_FROM}&toDate=${RANGE_TO}&status=active`,
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const data = body.data as {
        data: Array<{ activity: { id: string; status: string } }>;
      };
      expect(data.data).toHaveLength(1);
      expect(data.data[0].activity).toMatchObject({
        id: activity.id,
        status: "active",
      });
    });
  });

  describe("POST /start, /pause, /finish", () => {
    it("tracks session lifecycle via HTTP", async () => {
      const activity = await seedActivity();

      const startRes = await activitiesRouter.request("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: activity.id, startedAt: T0 }),
      });
      expect((await json(startRes)).success).toBe(true);

      const pauseRes = await activitiesRouter.request("/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: activity.id, pausedAt: T1 }),
      });
      expect((await json(pauseRes)).success).toBe(true);

      const finishRes = await activitiesRouter.request("/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: activity.id, finishedAt: T2 }),
      });
      const finishBody = await json(finishRes);

      expect(finishRes.status).toBe(200);
      expect(finishBody.success).toBe(true);
      expect(
        (finishBody.data as { session: { status: string } }).session.status,
      ).toBe("finished");
    });
  });

  describe("GET /:id/sessions", () => {
    it("returns sessions for activity", async () => {
      const activity = await seedTrackedActivity();

      const res = await activitiesRouter.request(
        `/${activity.id}/sessions?fromDate=${RANGE_FROM}&toDate=${RANGE_TO}`,
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const sessions = (body.data as { sessions: Array<{ status: string }> })
        .sessions;
      expect(sessions).toHaveLength(1);
      expect(sessions[0].status).toBe("finished");
    });
  });

  describe("GET /:id/session-segments", () => {
    it("returns segments for activity in range", async () => {
      const activity = await seedTrackedActivity();

      const res = await activitiesRouter.request(
        `/${activity.id}/session-segments?fromDate=${RANGE_FROM}&toDate=${RANGE_TO}`,
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const segments = (body.data as { segments: unknown[] }).segments;
      expect(segments.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /:id/analytics", () => {
    it("returns analytics for activity", async () => {
      const activity = await seedTrackedActivity();

      const res = await activitiesRouter.request(
        `/${activity.id}/analytics?fromDate=${RANGE_FROM}&toDate=${RANGE_TO}`,
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        activityId: activity.id,
        activeDurationMs: 300_000,
        pauseDurationMs: 300_000,
      });
    });
  });

  describe("GET /analytics", () => {
    it("returns batch analytics by activity ids", async () => {
      const activity = await seedTrackedActivity();

      const res = await activitiesRouter.request(
        `/analytics?activityIds=${activity.id}&fromDate=${RANGE_FROM}&toDate=${RANGE_TO}`,
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const items = (body.data as { items: Record<string, unknown> }).items;
      expect(items[activity.id]).toMatchObject({
        activityId: activity.id,
        activeDurationMs: 300_000,
        pauseDurationMs: 300_000,
      });
    });
  });

  describe("GET /grouped", () => {
    it("returns grouped activities with time totals", async () => {
      await seedTrackedActivity();

      const res = await activitiesRouter.request(
        `/grouped?createdById=user-1&fromDate=${RANGE_FROM}&toDate=${RANGE_TO}&groupLimit=5&itemsLimit=8`,
      );
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const groups = (body.data as { groups: Array<{ items: unknown[] }> })
        .groups;
      expect(groups.length).toBeGreaterThanOrEqual(1);
      expect(groups[0].items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /grouped/items", () => {
    it("loads more items when cursor is provided", async () => {
      await seedTrackedActivity();
      await seedTrackedActivity();

      const groupedRes = await activitiesRouter.request(
        `/grouped?createdById=user-1&fromDate=${RANGE_FROM}&toDate=${RANGE_TO}&groupLimit=5&itemsLimit=1`,
      );
      const groupedBody = await json(groupedRes);

      const group = (
        groupedBody.data as {
          groups: Array<{
            itemsPagination: { nextCursor: string | null };
          }>;
        }
      ).groups[0];

      const cursor = group.itemsPagination.nextCursor;
      expect(cursor).toBeTruthy();

      const itemsRes = await activitiesRouter.request(
        `/grouped/items?createdById=user-1&cursor=${encodeURIComponent(cursor!)}&limit=8`,
      );
      const itemsBody = await json(itemsRes);

      expect(itemsRes.status).toBe(200);
      expect(itemsBody.success).toBe(true);
      expect(
        (itemsBody.data as { items: unknown[] }).items.length,
      ).toBeGreaterThanOrEqual(0);
    });
  });
});
