import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Pool } from "pg";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetActivitiesTables,
  resetNotificationsTables,
  resetUsersTables,
  startTestDatabase,
} from "../setup/test-db.js";

const TEST_USER_ID = "11111111-1111-4111-8111-111111111111";

const seedUser = async (pool: Pool) => {
  await pool.query(
    `INSERT INTO users (id, login, password_hash, first_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (login) DO NOTHING`,
    [TEST_USER_ID, "notification-user", "hash", "Notification User"],
  );
};

const countPendingJobsByType = async (
  pool: Pool,
  activityId: string,
  type: string,
) => {
  const { rows } = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM notification_jobs
      WHERE activity_id = $1::uuid
        AND type = $2
        AND status = 'pending'
    `,
    [activityId, type],
  );

  return Number(rows[0]?.count ?? 0);
};

const seedActivityWithSession = async (
  pool: Pool,
  options: {
    goalSeconds: number;
    activeSegmentStartedAt: string;
    activeSegmentEndedAt: string | null;
  },
) => {
  const { rows: activityRows } = await pool.query<{ id: string }>(
    `
      INSERT INTO activities (title, created_by_id)
      VALUES ('Goal test', $1)
      RETURNING id
    `,
    [TEST_USER_ID],
  );
  const activityId = activityRows[0]!.id;

  const { rows: sessionRows } = await pool.query<{ id: string }>(
    `
      INSERT INTO activity_sessions (
        activity_id, started_at, status, active_duration_ms
      )
      VALUES ($1::uuid, $2::timestamptz, 'active', 7200000)
      RETURNING id
    `,
    [activityId, options.activeSegmentStartedAt],
  );
  const sessionId = sessionRows[0]!.id;

  await pool.query(
    `
      UPDATE activities
      SET last_activity_session_id = $2::uuid
      WHERE id = $1::uuid
    `,
    [activityId, sessionId],
  );

  const { rows: segmentRows } = await pool.query<{ id: string }>(
    `
      INSERT INTO activity_session_segments (
        session_id, segment_type, started_at, ended_at
      )
      VALUES ($1::uuid, 'active', $2::timestamptz, $3::timestamptz)
      RETURNING id
    `,
    [
      sessionId,
      options.activeSegmentStartedAt,
      options.activeSegmentEndedAt,
    ],
  );
  const segmentId = segmentRows[0]!.id;

  await pool.query(
    `
      UPDATE activity_sessions
      SET current_segment_id = $2::uuid
      WHERE id = $1::uuid
    `,
    [sessionId, segmentId],
  );

  const { activitySettingsQueries } =
    await import("../../src/activity/activitySettings.queries.js");

  await activitySettingsQueries.upsert(activityId, {
    sessionGoalSeconds: options.goalSeconds,
    notifyOnGoalReached: true,
    notifyOnLongPause: true,
    longPauseThresholdSeconds: 60,
    notifyOnLongActivity: true,
    longActivityThresholdSeconds: 60,
  });

  return { activityId, sessionId, segmentId };
};

describe("activityNotificationScheduler", () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    await resetNotificationsTables(testDb.pool);
    await resetActivitiesTables(testDb.pool);
    await resetUsersTables(testDb.pool);
    await seedUser(testDb.pool);
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  it("does not schedule goal after daily goal is already reached", async () => {
    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 3_600_000).toISOString();
    const oneHourAgo = new Date(now - 3_600_000).toISOString();

    const { activityId, sessionId, segmentId } = await seedActivityWithSession(
      testDb.pool,
      {
        goalSeconds: 3_600,
        activeSegmentStartedAt: twoHoursAgo,
        activeSegmentEndedAt: oneHourAgo,
      },
    );

    const { activityRepository } =
      await import("../../src/activity/activity.repository.js");
    const { activitySessionQueries } =
      await import("../../src/activity/activitySession.queries.js");
    const { activitySessionSegmentQueries } =
      await import("../../src/activity/activitySessionSegment.queries.js");
    const { activityNotificationScheduler } =
      await import("../../src/modules/notifications/activityNotification.scheduler.js");

    const activity = await activityRepository.getActivityById(activityId);
    const session = await activitySessionQueries.getActivitySessionById(sessionId);
    const segment = await activitySessionSegmentQueries.getSegmentById(segmentId);

    expect(activity).not.toBeNull();
    expect(session).not.toBeNull();
    expect(segment).not.toBeNull();

    await activityNotificationScheduler.onSessionActive({
      activity: activity!,
      session: session!,
      segment,
    });

    expect(
      await countPendingJobsByType(
        testDb.pool,
        activityId,
        "activity_goal_reached",
      ),
    ).toBe(0);
    expect(
      await countPendingJobsByType(
        testDb.pool,
        activityId,
        "activity_long_activity",
      ),
    ).toBe(1);
  });

  it("still schedules long pause after daily goal is already reached", async () => {
    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 3_600_000).toISOString();
    const thirtyMinutesAgo = new Date(now - 30 * 60_000).toISOString();

    const { activityId, sessionId, segmentId } = await seedActivityWithSession(
      testDb.pool,
      {
        goalSeconds: 3_600,
        activeSegmentStartedAt: twoHoursAgo,
        activeSegmentEndedAt: thirtyMinutesAgo,
      },
    );

    await testDb.pool.query(
      `
        UPDATE activity_sessions
        SET status = 'paused'
        WHERE id = $1::uuid
      `,
      [sessionId],
    );

    const { rows: pauseSegmentRows } = await testDb.pool.query<{ id: string }>(
      `
        INSERT INTO activity_session_segments (
          session_id, segment_type, started_at, ended_at
        )
        VALUES ($1::uuid, 'pause', $2::timestamptz, NULL)
        RETURNING id
      `,
      [sessionId, thirtyMinutesAgo],
    );

    const pauseSegmentId = pauseSegmentRows[0]!.id;

    await testDb.pool.query(
      `
        UPDATE activity_sessions
        SET current_segment_id = $2::uuid
        WHERE id = $1::uuid
      `,
      [sessionId, pauseSegmentId],
    );

    const { activityRepository } =
      await import("../../src/activity/activity.repository.js");
    const { activitySessionQueries } =
      await import("../../src/activity/activitySession.queries.js");
    const { activitySessionSegmentQueries } =
      await import("../../src/activity/activitySessionSegment.queries.js");
    const { activityNotificationScheduler } =
      await import("../../src/modules/notifications/activityNotification.scheduler.js");

    const activity = await activityRepository.getActivityById(activityId);
    const session = await activitySessionQueries.getActivitySessionById(sessionId);
    const segment =
      await activitySessionSegmentQueries.getSegmentById(pauseSegmentId);

    await activityNotificationScheduler.onSessionPaused({
      activity: activity!,
      session: session!,
      segment,
    });

    expect(
      await countPendingJobsByType(
        testDb.pool,
        activityId,
        "activity_goal_reached",
      ),
    ).toBe(0);
    expect(
      await countPendingJobsByType(
        testDb.pool,
        activityId,
        "activity_long_pause",
      ),
    ).toBe(1);
  });
});
