import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { TestDatabase } from "../setup/test-db.js";
import {
  releaseTestDatabase,
  resetActivitiesTables,
  startTestDatabase,
} from "../setup/test-db.js";

describe("activityRepository", () => {
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

  describe("createActivity", () => {
    it("creates activity in database and returns ActivityDTO", async () => {
      const { activityRepository } =
        await import("../../src/activity/activity.repository.js");

      const result = await activityRepository.createActivity({
        title: "Test activity",
        description: "Test description",
        createdById: "user-1",
        tags: ["work", "study"],
      });

      expect(result).toMatchObject({
        title: "Test activity",
        description: "Test description",
        createdById: "user-1",
        tags: ["work", "study"],
        currentSessionId: null,
        status: "idle",
        activeDurationMs: 0,
        pauseDurationMs: 0,
      });

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      const { rows } = await testDb.pool.query(
        `
          SELECT title, description, created_by_id, tags
          FROM activities
          WHERE id = $1
        `,
        [result.id],
      );

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        title: "Test activity",
        description: "Test description",
        created_by_id: "user-1",
        tags: ["work", "study"],
      });
    });
  });

  describe("updateActivity", () => {
    it("updates activity in database and returns ActivityDTO", async () => {
      const { activityRepository } =
        await import("../../src/activity/activity.repository.js");

      const created = await activityRepository.createActivity({
        title: "Original title",
        description: "Original description",
        createdById: "user-1",
        tags: ["work"],
      });

      const updated = await activityRepository.updateActivity({
        id: created.id,
        title: "  Updated title  ",
        description: "Updated description",
        tags: ["work", "study"],
      });

      expect(updated).toMatchObject({
        id: created.id,
        title: "Updated title",
        description: "Updated description",
        createdById: "user-1",
        tags: ["work", "study"],
        status: "idle",
        currentSessionId: null,
      });

      expect(updated?.updatedAt).not.toBe(created.updatedAt);

      const { rows } = await testDb.pool.query(
        `
          SELECT title, description, tags
          FROM activities
          WHERE id = $1
        `,
        [created.id],
      );

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        title: "Updated title",
        description: "Updated description",
        tags: ["work", "study"],
      });
    });

    it("returns null when activity does not exist", async () => {
      const { activityRepository } =
        await import("../../src/activity/activity.repository.js");

      const updated = await activityRepository.updateActivity({
        id: "00000000-0000-0000-0000-000000000000",
        title: "New title",
      });

      expect(updated).toBeNull();
    });
  });

  describe("deleteActivity", () => {
    it("deletes activity from database and returns true", async () => {
      const { activityRepository } =
        await import("../../src/activity/activity.repository.js");

      const created = await activityRepository.createActivity({
        title: "To delete",
        createdById: "user-1",
      });

      const deleted = await activityRepository.deleteActivity({
        id: created.id,
      });

      expect(deleted).toBe(true);

      const { rows } = await testDb.pool.query(
        "SELECT id FROM activities WHERE id = $1",
        [created.id],
      );

      expect(rows).toHaveLength(0);

      const found = await activityRepository.getActivityById(created.id);
      expect(found).toBeNull();
    });

    it("returns false when activity does not exist", async () => {
      const { activityRepository } =
        await import("../../src/activity/activity.repository.js");

      const deleted = await activityRepository.deleteActivity({
        id: "00000000-0000-0000-0000-000000000000",
      });

      expect(deleted).toBe(false);
    });
  });
});
