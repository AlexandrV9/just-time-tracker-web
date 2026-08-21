import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Hono } from "hono";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetActivitiesTables,
  resetDayPlansTables,
  startTestDatabase,
} from "../setup/test-db.js";
import { dayPlansRouter } from "../../src/dayPlan/dayPlan.routes.js";
import { TEST_USER_ID } from "../setup/test-auth.js";
import type { AuthVariables } from "../../src/shared/auth/auth.variables.js";

type JsonBody = Record<string, unknown>;

const json = async (res: Response): Promise<JsonBody> =>
  (await res.json()) as JsonBody;

const OTHER_USER_ID = "user-2";

describe("GET /day-plans/by-range", () => {
  let testDb: TestDatabase;
  let testRouter: Hono<{ Variables: AuthVariables }>;

  beforeAll(async () => {
    testDb = await startTestDatabase();
    testRouter = new Hono<{ Variables: AuthVariables }>();
    testRouter.use("*", async (c, next) => {
      c.set("user", { id: TEST_USER_ID });
      await next();
    });
    testRouter.route("/day-plans", dayPlansRouter);
  });

  beforeEach(async () => {
    await resetDayPlansTables(testDb.pool);
    await resetActivitiesTables(testDb.pool);
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  const seedActivity = async (
    title: string,
    createdById = TEST_USER_ID,
  ) => {
    const { activityRepository } =
      await import("../../src/activity/activity.repository.js");

    return activityRepository.createActivity({
      title,
      createdById,
      tags: [],
    });
  };

  const seedDayPlanWithActivities = async ({
    date,
    titles,
    createdById = TEST_USER_ID,
  }: {
    date: string;
    titles: string[];
    createdById?: string;
  }) => {
    const { dayPlanQueries } =
      await import("../../src/dayPlan/dayPlan.queries.js");
    const { dayPlanItemQueries } =
      await import("../../src/dayPlan/dayPlanItem.queries.js");

    const dayPlan = await dayPlanQueries.createDayPlan({
      date,
      createdById,
    });

    for (const title of titles) {
      const activity = await seedActivity(title, createdById);
      await dayPlanItemQueries.createDayPlanItem({
        dayPlanId: dayPlan.id,
        activityId: activity.id,
      });
    }

    return dayPlan;
  };

  it("returns activities grouped by day within range", async () => {
    await seedDayPlanWithActivities({
      date: "2026-07-28",
      titles: ["Alpha", "Beta"],
    });
    await seedDayPlanWithActivities({
      date: "2026-07-30",
      titles: ["Gamma"],
    });
    await seedDayPlanWithActivities({
      date: "2026-08-01",
      titles: ["Outside"],
    });

    const res = await testRouter.request(
      "/day-plans/by-range?fromDate=2026-07-28&toDate=2026-07-31",
    );
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([
      {
        date: "2026-07-28",
        activities: [{ name: "Alpha" }, { name: "Beta" }],
      },
      {
        date: "2026-07-30",
        activities: [{ name: "Gamma" }],
      },
    ]);
  });

  it("omits days with a plan but no activities", async () => {
    const { dayPlanQueries } =
      await import("../../src/dayPlan/dayPlan.queries.js");

    await dayPlanQueries.createDayPlan({
      date: "2026-07-29",
      createdById: TEST_USER_ID,
    });
    await seedDayPlanWithActivities({
      date: "2026-07-30",
      titles: ["Only this"],
    });

    const res = await testRouter.request(
      "/day-plans/by-range?fromDate=2026-07-28&toDate=2026-07-31",
    );
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([
      {
        date: "2026-07-30",
        activities: [{ name: "Only this" }],
      },
    ]);
  });

  it("returns empty list when nothing matches", async () => {
    const res = await testRouter.request(
      "/day-plans/by-range?fromDate=2026-01-01&toDate=2026-01-07",
    );
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: [],
    });
  });

  it("scopes results to the authenticated user", async () => {
    await seedDayPlanWithActivities({
      date: "2026-07-30",
      titles: ["Mine"],
      createdById: TEST_USER_ID,
    });
    await seedDayPlanWithActivities({
      date: "2026-07-30",
      titles: ["Theirs"],
      createdById: OTHER_USER_ID,
    });

    const res = await testRouter.request(
      "/day-plans/by-range?fromDate=2026-07-30&toDate=2026-07-30",
    );
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([
      {
        date: "2026-07-30",
        activities: [{ name: "Mine" }],
      },
    ]);
  });

  it("rejects invalid date format", async () => {
    const res = await testRouter.request(
      "/day-plans/by-range?fromDate=30-07-2026&toDate=2026-07-31",
    );
    const body = await json(res);

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Validation failed");
  });

  it("rejects when toDate is before fromDate", async () => {
    const res = await testRouter.request(
      "/day-plans/by-range?fromDate=2026-07-31&toDate=2026-07-28",
    );
    const body = await json(res);

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Validation failed");
  });

  it("rejects missing query params", async () => {
    const res = await testRouter.request("/day-plans/by-range");
    const body = await json(res);

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Validation failed");
  });
});
