import type { ActivitySessionSegmentDTO } from "@to-do-list/shared";
import { pool } from "../shared/index.js";

export const SEGMENT_RETURNING = `
  id,
  created_at AS "createdAt",
  updated_at AS "updatedAt",
  session_id AS "sessionId",
  segment_type AS "type",
  started_at AS "startedAt",
  ended_at AS "endedAt"
`;

const mapRow = (row: Record<string, unknown>): ActivitySessionSegmentDTO => ({
  id: String(row.id),
  createdAt: String(row.createdAt),
  updatedAt: String(row.updatedAt),
  sessionId: String(row.sessionId),
  type: row.type as ActivitySessionSegmentDTO["type"],
  startedAt: String(row.startedAt),
  endedAt:
    row.endedAt === null || row.endedAt === undefined
      ? null
      : String(row.endedAt),
});

export type InsertActivitySessionSegmentInput = {
  sessionId: string;
  type: ActivitySessionSegmentDTO["type"];
  startedAt: string;
  endedAt: string | null;
};

const createSegment = async (
  input: InsertActivitySessionSegmentInput,
): Promise<ActivitySessionSegmentDTO> => {
  const { sessionId, type, startedAt, endedAt } = input;

  const query = `
    INSERT INTO activity_session_segments (
      session_id, segment_type, started_at, ended_at, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING ${SEGMENT_RETURNING}
  `;

  const { rows } = await pool.query(query, [
    sessionId,
    type,
    startedAt,
    endedAt,
  ]);

  return mapRow(rows[0]);
};

const getSegmentById = async (
  id: string,
): Promise<ActivitySessionSegmentDTO | null> => {
  const { rows } = await pool.query(
    `SELECT ${SEGMENT_RETURNING} FROM activity_session_segments WHERE id = $1`,
    [id],
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
};

const getSegmentsBySessionId = async (
  sessionId: string,
): Promise<ActivitySessionSegmentDTO[]> => {
  const { rows } = await pool.query(
    `
    SELECT ${SEGMENT_RETURNING}
    FROM activity_session_segments
    WHERE session_id = $1
    ORDER BY started_at ASC
    `,
    [sessionId],
  );
  return rows.map((r) => mapRow(r));
};

export type SegmentIntervalRow = {
  type: ActivitySessionSegmentDTO["type"];
  startedAt: string;
  endedAt: string | null;
};

const listSegmentIntervalsForActivityInRange = async (
  activityId: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<SegmentIntervalRow[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      seg.segment_type AS "type",
      seg.started_at AS "startedAt",
      seg.ended_at AS "endedAt"
    FROM activity_session_segments seg
    INNER JOIN activity_sessions s ON s.id = seg.session_id
    WHERE s.activity_id = $1::uuid
      AND seg.started_at < COALESCE($2::timestamptz, 'infinity'::timestamptz)
      AND COALESCE(seg.ended_at, NOW()) > COALESCE($3::timestamptz, '-infinity'::timestamptz)
    ORDER BY seg.started_at ASC
    `,
    [activityId, toDate, fromDate],
  );

  return rows.map((r) => ({
    type: r.type as ActivitySessionSegmentDTO["type"],
    startedAt: String(r.startedAt),
    endedAt:
      r.endedAt === null || r.endedAt === undefined
        ? null
        : String(r.endedAt),
  }));
};

const getSegmentBySessionId = async (
  sessionId: string,
): Promise<ActivitySessionSegmentDTO | null> => {
  const { rows } = await pool.query(
    `
    SELECT ${SEGMENT_RETURNING}
    FROM activity_session_segments
    WHERE session_id = $1::uuid AND ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1
    `,
    [sessionId],
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
};

export type UpdateActivitySessionSegmentInput = {
  id: string;
  startedAt?: string;
  endedAt?: string | null;
};

const updateActivitySessionSegment = async (
  input: UpdateActivitySessionSegmentInput,
): Promise<ActivitySessionSegmentDTO | null> => {
  const { id, ...rest } = input;
  const updates: string[] = [];
  const params: unknown[] = [];

  const add = (field: string, value: unknown) => {
    if (value === undefined) return;
    params.push(value);
    updates.push(`${field} = $${params.length}`);
  };

  add("started_at", rest.startedAt);
  add("ended_at", rest.endedAt);

  if (!updates.length) {
    return getSegmentBySessionId(id);
  }

  params.push(new Date().toISOString());
  updates.push(`updated_at = $${params.length}`);

  const query = `
    UPDATE activity_session_segments
    SET ${updates.join(", ")}
    WHERE id = $${params.length + 1}
    RETURNING ${SEGMENT_RETURNING}
  `;

  const { rows } = await pool.query(query, [...params, id]);
  const row = rows[0];
  return row ? mapRow(row) : null;
};

export const activitySessionSegmentQueries = {
  createSegment,
  getSegmentById,
  getSegmentBySessionId,
  getSegmentsBySessionId,
  listSegmentIntervalsForActivityInRange,
  updateActivitySessionSegment,
};
