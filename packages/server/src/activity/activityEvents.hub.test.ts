import { describe, it, expect, vi } from "vitest";
import type { ActivityTrackingEventDTO } from "@to-do-list/shared";
import { activityEventsHub } from "./activityEvents.hub.js";

const sampleEvent: ActivityTrackingEventDTO = {
  type: "started",
  clientId: "client-a",
  data: {
    activity: {
      id: "activity-1",
      title: "Test",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      createdById: "user-1",
      tags: [],
      status: "active",
      currentSessionId: "session-1",
      activeDurationMs: 0,
      pauseDurationMs: 0,
    },
    session: {
      id: "session-1",
      activityId: "activity-1",
      status: "active",
      startedAt: "2026-01-01T00:00:00.000Z",
      endedAt: null,
      activeDurationMs: 0,
      pauseDurationMs: 0,
      currentSegmentId: "segment-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    segment: {
      id: "segment-1",
      sessionId: "session-1",
      type: "active",
      startedAt: "2026-01-01T00:00:00.000Z",
      endedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  },
};

describe("activityEventsHub", () => {
  it("notifies subscribers for the same user", () => {
    const listener = vi.fn();
    const unsubscribe = activityEventsHub.subscribe("user-1", listener);

    activityEventsHub.publish("user-1", sampleEvent);

    expect(listener).toHaveBeenCalledWith(sampleEvent);
    unsubscribe();
  });

  it("does not notify subscribers of other users", () => {
    const listener = vi.fn();
    const unsubscribe = activityEventsHub.subscribe("user-1", listener);

    activityEventsHub.publish("user-2", sampleEvent);

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = activityEventsHub.subscribe("user-1", listener);

    unsubscribe();
    activityEventsHub.publish("user-1", sampleEvent);

    expect(listener).not.toHaveBeenCalled();
  });

  it("matches numeric and string user ids", () => {
    const listener = vi.fn();
    const unsubscribe = activityEventsHub.subscribe(1, listener);

    activityEventsHub.publish("1", sampleEvent);

    expect(listener).toHaveBeenCalledWith(sampleEvent);
    unsubscribe();
  });
});
