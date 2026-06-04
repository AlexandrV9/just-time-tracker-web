import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetActivitiesTables,
  startTestDatabase,
} from "../setup/test-db.js";

const T0 = "2025-01-01T10:00:00.000Z";
const T1 = "2025-01-01T10:05:00.000Z";
const T2 = "2025-01-01T10:10:00.000Z";

describe("activitiesService start / pause / finish", () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    await resetActivitiesTables(testDb.pool);
  });

  afterAll(async () => {
    await releaseTestDatabase();
  });

  it("runs start → pause → finish and persists session state in database", async () => {
    const { activityRepository } =
      await import("../../src/activity/activity.repository.js");
    const { activitiesService } =
      await import("../../src/activity/activity.service.js");

    const created = await activityRepository.createActivity({
      title: "Tracking test",
      createdById: "user-1",
    });

    const started = await activitiesService.startActivity({
      activityId: created.id,
      startedAt: T0,
    });

    expect(started.success).toBe(true);
    if (!started.success) return;

    expect(started.data.activity).toMatchObject({
      id: created.id,
      status: "active",
      currentSessionId: started.data.session.id,
    });
    expect(started.data.session).toMatchObject({
      activityId: created.id,
      status: "active",
      activeDurationMs: 0,
      pauseDurationMs: 0,
    });
    expect(started.data.segment).toMatchObject({
      sessionId: started.data.session.id,
      type: "active",
      endedAt: null,
    });

    const paused = await activitiesService.pauseActivity({
      activityId: created.id,
      pausedAt: T1,
    });

    expect(paused.success).toBe(true);
    if (!paused.success) return;

    expect(paused.data.activity).toMatchObject({
      status: "paused",
      activeDurationMs: 300_000,
      pauseDurationMs: 0,
    });
    expect(paused.data.session).toMatchObject({
      id: started.data.session.id,
      status: "paused",
      activeDurationMs: 300_000,
    });
    expect(paused.data.segment).toMatchObject({
      type: "pause",
      endedAt: null,
    });

    const finished = await activitiesService.finishActivity({
      activityId: created.id,
      finishedAt: T2,
    });

    expect(finished.success).toBe(true);
    if (!finished.success) return;

    expect(finished.data.activity).toMatchObject({
      status: "finished",
      activeDurationMs: 300_000,
      pauseDurationMs: 300_000,
    });
    expect(finished.data.session).toMatchObject({
      id: started.data.session.id,
      status: "finished",
      activeDurationMs: 300_000,
      pauseDurationMs: 300_000,
    });
    expect(finished.data.segment).toBeNull();

    const { rows: sessionRows } = await testDb.pool.query(
      `
        SELECT status, active_duration_ms, pause_duration_ms, ended_at
        FROM activity_sessions
        WHERE id = $1
      `,
      [started.data.session.id],
    );

    expect(sessionRows[0]).toMatchObject({
      status: "finished",
      active_duration_ms: "300000",
      pause_duration_ms: "300000",
    });
    expect(sessionRows[0].ended_at).not.toBeNull();
  });

  it("returns error when starting an already active session", async () => {
    const { activityRepository } =
      await import("../../src/activity/activity.repository.js");
    const { activitiesService } =
      await import("../../src/activity/activity.service.js");

    const created = await activityRepository.createActivity({
      title: "Double start",
      createdById: "user-1",
    });

    const first = await activitiesService.startActivity({
      activityId: created.id,
      startedAt: T0,
    });
    expect(first.success).toBe(true);

    const second = await activitiesService.startActivity({
      activityId: created.id,
      startedAt: T1,
    });

    expect(second).toEqual({
      success: false,
      message: "Session already active",
    });
  });

  it("handles cross-midnight session: start 23:50 → pause → resume → finish", async () => {
    const { activityRepository } =
      await import("../../src/activity/activity.repository.js");
    const { activitiesService } =
      await import("../../src/activity/activity.service.js");

    const startedYesterday = "2025-01-01T23:50:00.000Z";
    const pausedAfter20Min = "2025-01-02T00:10:00.000Z";
    const resumedAfter5MinPause = "2025-01-02T00:15:00.000Z";
    const finishedAfter5MinActive = "2025-01-02T00:20:00.000Z";

    const created = await activityRepository.createActivity({
      title: "Cross-midnight",
      createdById: "user-1",
    });

    const started = await activitiesService.startActivity({
      activityId: created.id,
      startedAt: startedYesterday,
    });
    expect(started.success).toBe(true);
    if (!started.success) return;

    const sessionId = started.data.session.id;

    const paused = await activitiesService.pauseActivity({
      activityId: created.id,
      pausedAt: pausedAfter20Min,
    });
    expect(paused.success).toBe(true);
    if (!paused.success) return;

    expect(paused.data.session).toMatchObject({
      id: sessionId,
      status: "paused",
      activeDurationMs: 1_200_000,
      pauseDurationMs: 0,
    });

    const resumed = await activitiesService.startActivity({
      activityId: created.id,
      startedAt: resumedAfter5MinPause,
    });
    expect(resumed.success).toBe(true);
    if (!resumed.success) return;

    expect(resumed.data.session).toMatchObject({
      id: sessionId,
      status: "active",
      activeDurationMs: 1_200_000,
      pauseDurationMs: 300_000,
    });

    const finished = await activitiesService.finishActivity({
      activityId: created.id,
      finishedAt: finishedAfter5MinActive,
    });
    expect(finished.success).toBe(true);
    if (!finished.success) return;

    expect(finished.data.activity).toMatchObject({
      activeDurationMs: 1_500_000,
      pauseDurationMs: 300_000,
    });
    expect(finished.data.session).toMatchObject({
      id: sessionId,
      status: "finished",
      activeDurationMs: 1_500_000,
      pauseDurationMs: 300_000,
    });

    const { rows: segments } = await testDb.pool.query(
      `
        SELECT segment_type, started_at, ended_at
        FROM activity_session_segments
        WHERE session_id = $1
        ORDER BY started_at ASC
      `,
      [sessionId],
    );

    expect(segments).toHaveLength(3);
    expect(segments[0]).toMatchObject({
      segment_type: "active",
    });
    expect(segments[1]).toMatchObject({
      segment_type: "pause",
    });
    expect(segments[2]).toMatchObject({
      segment_type: "active",
    });
    expect(segments.every((s) => s.ended_at !== null)).toBe(true);

    const analytics = await activitiesService.getActivityAnalytics({
      activityId: created.id,
      fromDate: "2025-01-01T00:00:00.000Z",
      toDate: "2025-01-03T00:00:00.000Z",
    });

    expect(
      analytics.success,
      !analytics.success ? analytics.message : undefined,
    ).toBe(true);
    if (!analytics.success) return;

    expect(analytics.data).toMatchObject({
      activityId: created.id,
      activeDurationMs: 1_500_000,
      pauseDurationMs: 300_000,
    });

    const days = analytics.data.days;
    expect(days).toHaveLength(2);

    const dayJan1 = days.find((d) => d.day.startsWith("2025-01-01"));
    const dayJan2 = days.find((d) => d.day.startsWith("2025-01-02"));

    expect(dayJan1).toMatchObject({
      activeDurationMs: 600_000,
      pauseDurationMs: 0,
    });
    expect(dayJan2).toMatchObject({
      activeDurationMs: 900_000,
      pauseDurationMs: 300_000,
    });
  });

  it("returns error when pausing without an active session", async () => {
    const { activityRepository } =
      await import("../../src/activity/activity.repository.js");
    const { activitiesService } =
      await import("../../src/activity/activity.service.js");

    const created = await activityRepository.createActivity({
      title: "Pause without start",
      createdById: "user-1",
    });

    const result = await activitiesService.pauseActivity({
      activityId: created.id,
      pausedAt: T0,
    });

    expect(result).toEqual({
      success: false,
      message: "No session to pause",
    });
  });
});
