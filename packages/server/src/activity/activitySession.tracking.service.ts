import type { ActivityDTO, ActivitySessionDTO } from "@to-do-list/shared";
import type { PoolClient } from "pg";
import { pool } from "../shared/index.js";
import { activityRepository } from "./activity.repository.js";
import { activitySessionQueries } from "./activitySession.queries.js";
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";

type TrackingOk = SuccessResponse<{
  activity: ActivityDTO;
  session: ActivitySessionDTO;
}>;
type TrackingErr = ErrorResponse;

const nowIso = () => new Date().toISOString();
const nowMs = () => Date.now();

async function insertNewSessionWithActiveSegment(
  client: PoolClient,
  activityId: string,
  startedAtIso: string,
): Promise<string> {
  const { rows } = await client.query<{ id: string }>(
    `
    INSERT INTO activity_sessions (
      activity_id, started_at, ended_at, status,
      active_duration_ms, pause_duration_ms, created_at, updated_at
    )
    VALUES ($1::uuid, $2::timestamptz, NULL, 'active', 0, 0, NOW(), NOW())
    RETURNING id
    `,
    [activityId, startedAtIso],
  );
  const sessionId = String(rows[0].id);
  await client.query(
    `
    UPDATE activities
    SET last_activity_session_id = $2::uuid, updated_at = NOW()
    WHERE id = $1::uuid
    `,
    [activityId, sessionId],
  );
  await client.query(
    `
    INSERT INTO activity_session_segments (
      session_id, segment_type, started_at, ended_at, created_at, updated_at
    )
    VALUES ($1::uuid, 'active', $2::timestamptz, NULL, NOW(), NOW())
    `,
    [sessionId, startedAtIso],
  );
  return sessionId;
}

async function loadActivityRowForUpdate(
  client: PoolClient,
  activityId: string,
): Promise<{
  id: string;
  last_activity_session_id: string | null;
} | null> {
  const { rows } = await client.query<{
    id: string;
    last_activity_session_id: string | null;
  }>(
    `
    SELECT id, last_activity_session_id
    FROM activities
    WHERE id = $1::uuid
    FOR UPDATE
    `,
    [activityId],
  );
  return rows[0] ?? null;
}

export async function playActivitySession(
  activityId: string,
): Promise<TrackingOk | TrackingErr> {
  const client = await pool.connect();
  let sessionIdOut: string | null = null;
  try {
    await client.query("BEGIN");
    const activityRow = await loadActivityRowForUpdate(client, activityId);
    if (!activityRow) {
      await client.query("ROLLBACK");
      return { success: false, message: "Activity not found" };
    }

    const tIso = nowIso();
    const tMs = nowMs();

    const startFresh = async () => {
      sessionIdOut = await insertNewSessionWithActiveSegment(
        client,
        activityId,
        tIso,
      );
    };

    if (!activityRow.last_activity_session_id) {
      await startFresh();
      await client.query("COMMIT");
    } else {
      const { rows: sessRows } = await client.query<{
        id: string;
        status: string;
      }>(
        `
        SELECT id, status
        FROM activity_sessions
        WHERE id = $1::uuid AND activity_id = $2::uuid
        FOR UPDATE
        `,
        [activityRow.last_activity_session_id, activityId],
      );
      const sess = sessRows[0];

      if (!sess) {
        await startFresh();
        await client.query("COMMIT");
      } else if (sess.status === "finished") {
        await startFresh();
        await client.query("COMMIT");
      } else if (sess.status === "active") {
        await client.query("ROLLBACK");
        return { success: false, message: "Session already active" };
      } else if (sess.status === "paused") {
        const sid = activityRow.last_activity_session_id;
        const { rows: segRows } = await client.query<{
          id: string;
          segment_type: string;
          started_at: Date | string;
        }>(
          `
          SELECT id, segment_type, started_at
          FROM activity_session_segments
          WHERE session_id = $1::uuid AND ended_at IS NULL
          ORDER BY started_at DESC
          LIMIT 1
          FOR UPDATE
          `,
          [sid],
        );
        const open = segRows[0];
        if (!open || open.segment_type !== "pause") {
          await client.query("ROLLBACK");
          return { success: false, message: "Invalid session state" };
        }
        const pauseDeltaMs = tMs - new Date(open.started_at).getTime();
        await client.query(
          `
          UPDATE activity_session_segments
          SET ended_at = $1::timestamptz, updated_at = NOW()
          WHERE id = $2::uuid
          `,
          [tIso, open.id],
        );
        await client.query(
          `
          UPDATE activity_sessions
          SET
            pause_duration_ms = pause_duration_ms + $2::bigint,
            status = 'active',
            updated_at = NOW()
          WHERE id = $1::uuid
          `,
          [sid, pauseDeltaMs],
        );
        await client.query(
          `
          UPDATE activities
          SET
            pause_duration_ms = pause_duration_ms + $2::bigint,
            updated_at = NOW()
          WHERE id = $1::uuid
          `,
          [activityId, pauseDeltaMs],
        );
        await client.query(
          `
          INSERT INTO activity_session_segments (
            session_id, segment_type, started_at, ended_at, created_at, updated_at
          )
          VALUES ($1::uuid, 'active', $2::timestamptz, NULL, NOW(), NOW())
          `,
          [sid, tIso],
        );
        sessionIdOut = sid;
        await client.query("COMMIT");
      } else {
        await client.query("ROLLBACK");
        return { success: false, message: "Unexpected session status" };
      }
    }
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("playActivitySession:", e);
    return { success: false, message: "Failed to resume session" };
  } finally {
    client.release();
  }

  const sid = sessionIdOut;
  if (!sid) {
    return { success: false, message: "Tracking result missing" };
  }

  const activity = await activityRepository.getActivityById(activityId);
  const session = await activitySessionQueries.getActivitySessionById(sid);
  if (!activity || !session) {
    return { success: false, message: "Failed to load result" };
  }
  return { success: true, data: { activity, session } };
}

export async function pauseActivitySession(
  activityId: string,
): Promise<TrackingOk | TrackingErr> {
  const client = await pool.connect();
  let sessionIdOut: string | null = null;
  try {
    await client.query("BEGIN");
    const activityRow = await loadActivityRowForUpdate(client, activityId);
    if (!activityRow?.last_activity_session_id) {
      await client.query("ROLLBACK");
      return { success: false, message: "No session to pause" };
    }

    const sid = activityRow.last_activity_session_id;
    const tIso = nowIso();
    const tMs = nowMs();

    const { rows: sessRows } = await client.query<{ status: string }>(
      `
      SELECT status
      FROM activity_sessions
      WHERE id = $1::uuid AND activity_id = $2::uuid
      FOR UPDATE
      `,
      [sid, activityId],
    );
    const sess = sessRows[0];
    if (!sess || sess.status !== "active") {
      await client.query("ROLLBACK");
      return { success: false, message: "Session is not active" };
    }

    const { rows: segRows } = await client.query<{
      id: string;
      segment_type: string;
      started_at: Date | string;
    }>(
      `
      SELECT id, segment_type, started_at
      FROM activity_session_segments
      WHERE session_id = $1::uuid AND ended_at IS NULL
      ORDER BY started_at DESC
      LIMIT 1
      FOR UPDATE
      `,
      [sid],
    );
    const open = segRows[0];
    if (!open || open.segment_type !== "active") {
      await client.query("ROLLBACK");
      return { success: false, message: "No active segment" };
    }

    const activeDeltaMs = tMs - new Date(open.started_at).getTime();

    await client.query(
      `
      UPDATE activity_session_segments
      SET ended_at = $1::timestamptz, updated_at = NOW()
      WHERE id = $2::uuid
      `,
      [tIso, open.id],
    );
    await client.query(
      `
      UPDATE activity_sessions
      SET
        active_duration_ms = active_duration_ms + $2::bigint,
        status = 'paused',
        updated_at = NOW()
      WHERE id = $1::uuid
      `,
      [sid, activeDeltaMs],
    );
    await client.query(
      `
      UPDATE activities
      SET
        active_duration_ms = active_duration_ms + $2::bigint,
        updated_at = NOW()
      WHERE id = $1::uuid
      `,
      [activityId, activeDeltaMs],
    );
    await client.query(
      `
      INSERT INTO activity_session_segments (
        session_id, segment_type, started_at, ended_at, created_at, updated_at
      )
      VALUES ($1::uuid, 'pause', $2::timestamptz, NULL, NOW(), NOW())
      `,
      [sid, tIso],
    );

    await client.query("COMMIT");
    sessionIdOut = sid;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("pauseActivitySession:", e);
    return { success: false, message: "Failed to pause session" };
  } finally {
    client.release();
  }

  const sid = sessionIdOut;
  if (!sid) {
    return { success: false, message: "Tracking result missing" };
  }

  const activity = await activityRepository.getActivityById(activityId);
  const session = await activitySessionQueries.getActivitySessionById(sid);
  if (!activity || !session) {
    return { success: false, message: "Failed to load result" };
  }
  return { success: true, data: { activity, session } };
}

export async function finishActivitySession(
  activityId: string,
): Promise<TrackingOk | TrackingErr> {
  const client = await pool.connect();
  let sessionIdOut: string | null = null;
  try {
    await client.query("BEGIN");
    const activityRow = await loadActivityRowForUpdate(client, activityId);
    if (!activityRow?.last_activity_session_id) {
      await client.query("ROLLBACK");
      return { success: false, message: "No session to stop" };
    }

    const sid = activityRow.last_activity_session_id;
    const tIso = nowIso();
    const tMs = nowMs();

    const { rows: sessRows } = await client.query<{
      id: string;
      status: string;
    }>(
      `
      SELECT id, status
      FROM activity_sessions
      WHERE id = $1::uuid AND activity_id = $2::uuid
      FOR UPDATE
      `,
      [sid, activityId],
    );
    const sess = sessRows[0];
    if (!sess) {
      await client.query("ROLLBACK");
      return { success: false, message: "Session not found" };
    }
    if (sess.status === "finished") {
      await client.query("ROLLBACK");
      return { success: false, message: "Session already finished" };
    }

    const { rows: segRows } = await client.query<{
      id: string;
      segment_type: string;
      started_at: Date | string;
    }>(
      `
      SELECT id, segment_type, started_at
      FROM activity_session_segments
      WHERE session_id = $1::uuid AND ended_at IS NULL
      ORDER BY started_at DESC
      LIMIT 1
      FOR UPDATE
      `,
      [sid],
    );
    const open = segRows[0];
    if (!open) {
      await client.query("ROLLBACK");
      return { success: false, message: "No open segment" };
    }

    if (open.segment_type === "active") {
      const activeDeltaMs = tMs - new Date(open.started_at).getTime();
      await client.query(
        `
        UPDATE activity_session_segments
        SET ended_at = $1::timestamptz, updated_at = NOW()
        WHERE id = $2::uuid
        `,
        [tIso, open.id],
      );
      await client.query(
        `
        UPDATE activity_sessions
        SET
          active_duration_ms = active_duration_ms + $2::bigint,
          status = 'finished',
          ended_at = $3::timestamptz,
          updated_at = NOW()
        WHERE id = $1::uuid
        `,
        [sid, activeDeltaMs, tIso],
      );
      await client.query(
        `
        UPDATE activities
        SET
          active_duration_ms = active_duration_ms + $2::bigint,
          updated_at = NOW()
        WHERE id = $1::uuid
        `,
        [activityId, activeDeltaMs],
      );
    } else if (open.segment_type === "pause") {
      const pauseDeltaMs = tMs - new Date(open.started_at).getTime();
      await client.query(
        `
        UPDATE activity_session_segments
        SET ended_at = $1::timestamptz, updated_at = NOW()
        WHERE id = $2::uuid
        `,
        [tIso, open.id],
      );
      await client.query(
        `
        UPDATE activity_sessions
        SET
          pause_duration_ms = pause_duration_ms + $2::bigint,
          status = 'finished',
          ended_at = $3::timestamptz,
          updated_at = NOW()
        WHERE id = $1::uuid
        `,
        [sid, pauseDeltaMs, tIso],
      );
      await client.query(
        `
        UPDATE activities
        SET
          pause_duration_ms = pause_duration_ms + $2::bigint,
          updated_at = NOW()
        WHERE id = $1::uuid
        `,
        [activityId, pauseDeltaMs],
      );
    } else {
      await client.query("ROLLBACK");
      return { success: false, message: "Invalid segment type" };
    }

    await client.query("COMMIT");
    sessionIdOut = sid;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("finishActivitySession:", e);
    return { success: false, message: "Failed to stop session" };
  } finally {
    client.release();
  }

  const sid = sessionIdOut;
  if (!sid) {
    return { success: false, message: "Tracking result missing" };
  }

  const activity = await activityRepository.getActivityById(activityId);
  const session = await activitySessionQueries.getActivitySessionById(sid);
  if (!activity || !session) {
    return { success: false, message: "Failed to load result" };
  }
  return { success: true, data: { activity, session } };
}
