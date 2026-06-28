import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../shared/db/utils.js", () => ({
  testConnection: vi.fn(),
}));

import { healthRouter } from "./health.routes.js";
import { testConnection } from "../shared/db/utils.js";

const mockTestConnection = vi.mocked(testConnection);

describe("healthRouter GET /", () => {
  beforeEach(() => {
    mockTestConnection.mockReset();
  });

  it("returns 200 and status OK when the database check succeeds", async () => {
    mockTestConnection.mockResolvedValue({
      success: true,
      message: "Database connection successful",
      details: {
        database: "time_tracker_test",
        host: "localhost",
        port: 5432,
        user: "test",
        connectionTime: 5,
        timestamp: "2026-01-01T00:00:00.000Z",
      },
    });

    const res = await healthRouter.request("/");

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe("OK");
    expect(body.success).toBe(true);
    expect(body.message).toBe("Database connection successful");
    expect(body.details).toMatchObject({
      database: "time_tracker_test",
      host: "localhost",
      port: 5432,
      user: "test",
    });
    expect(mockTestConnection).toHaveBeenCalledTimes(1);
  });

  it("returns 503 and status ERROR when the database check fails", async () => {
    mockTestConnection.mockResolvedValue({
      success: false,
      message: "Database connection failed",
      details: {
        database: "unknown",
        host: "localhost",
        port: 5432,
        user: "unknown",
        connectionTime: 1,
        timestamp: "2026-01-01T00:00:00.000Z",
      },
      error: "connection refused",
    });

    const res = await healthRouter.request("/");

    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe("ERROR");
    expect(body.success).toBe(false);
    expect(body.message).toBe("Database connection failed");
    expect(body.error).toBe("connection refused");
    expect(mockTestConnection).toHaveBeenCalledTimes(1);
  });
});
