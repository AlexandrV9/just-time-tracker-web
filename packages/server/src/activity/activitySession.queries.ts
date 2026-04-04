import type {
  ActivitySessionDTO,
  CreateActivitySessionDataDTO,
  UpdateActivitySessionDataDTO,
} from "@to-do-list/shared";
import { pool } from "../shared/index.js";

export const SESSION_RETURNING = `
  id,
  created_at AS "createdAt",
  updated_at AS "updatedAt",
  activity_id AS "activityId",
  started_at AS "startedAt",
  ended_at AS "endedAt",
  status,
  active_duration_ms AS "activeDurationMs",
  pause_duration_ms AS "pauseDurationMs"
`;

const mapRow = (row: Record<string, unknown>): ActivitySessionDTO => ({
  id: String(row.id),
  createdAt: String(row.createdAt),
  updatedAt: String(row.updatedAt),
  activityId: String(row.activityId),
  startedAt: String(row.startedAt),
  endedAt:
    row.endedAt === null || row.endedAt === undefined
      ? null
      : String(row.endedAt),
  status: row.status as ActivitySessionDTO["status"],
  activeDurationMs: Number(row.activeDurationMs ?? 0),
  pauseDurationMs: Number(row.pauseDurationMs ?? 0),
});

const createActivitySession = async (
  data: CreateActivitySessionDataDTO,
): Promise<ActivitySessionDTO> => {
  const {
    activityId,
    startedAt,
    endedAt,
    status,
    activeDurationMs = 0,
    pauseDurationMs = 0,
  } = data;

  const query = `
    INSERT INTO activity_sessions (
      activity_id, started_at, ended_at, status,
      active_duration_ms, pause_duration_ms, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING ${SESSION_RETURNING}
  `;

  const { rows } = await pool.query(query, [
    activityId,
    startedAt,
    endedAt,
    status,
    activeDurationMs,
    pauseDurationMs,
  ]);

  return mapRow(rows[0]);
};

const getActivitySessionById = async (
  id: string,
): Promise<ActivitySessionDTO | null> => {
  const { rows } = await pool.query(
    `SELECT ${SESSION_RETURNING} FROM activity_sessions WHERE id = $1`,
    [id],
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
};

const getActivitySessionsByActivityId = async (
  activityId: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<ActivitySessionDTO[]> => {
  const { rows } = await pool.query(
    `
    SELECT ${SESSION_RETURNING}
    FROM activity_sessions
    WHERE activity_id = $1
      AND started_at < COALESCE($2::timestamptz, 'infinity'::timestamptz)
      AND COALESCE(ended_at, NOW()) > COALESCE($3::timestamptz, '-infinity'::timestamptz)
    ORDER BY started_at DESC
    `,
    [activityId, toDate, fromDate],
  );
  return rows.map((r) => mapRow(r));
};

export type UpdateActivitySessionInput = {
  id: string;
  startedAt?: string;
  endedAt?: string | null;
  status?: ActivitySessionDTO["status"];
  activeDurationMs?: number;
  pauseDurationMs?: number;
};

const updateActivitySession = async (
  data: UpdateActivitySessionDataDTO,
): Promise<ActivitySessionDTO | null> => {
  const { id, ...rest } = data;
  const updates: string[] = [];
  const params: unknown[] = [];

  const add = (field: string, value: unknown) => {
    if (value === undefined) return;
    params.push(value);
    updates.push(`${field} = $${params.length}`);
  };

  add("started_at", rest.startedAt);
  add("ended_at", rest.endedAt);
  add("status", rest.status);
  add("active_duration_ms", rest.activeDurationMs);
  add("pause_duration_ms", rest.pauseDurationMs);

  if (!updates.length) {
    return getActivitySessionById(id);
  }

  params.push(new Date().toISOString());
  updates.push(`updated_at = $${params.length}`);

  const query = `
    UPDATE activity_sessions
    SET ${updates.join(", ")}
    WHERE id = $${params.length + 1}
    RETURNING ${SESSION_RETURNING}
  `;

  const { rows } = await pool.query(query, [...params, id]);
  const row = rows[0];
  return row ? mapRow(row) : null;
};

export const activitySessionQueries = {
  createActivitySession,
  getActivitySessionById,
  getActivitySessionsByActivityId,
  updateActivitySession,
};
