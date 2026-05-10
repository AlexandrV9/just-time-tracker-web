import type {
  CreateActivityDataDTO,
  GetActivitiesDTO,
  ActivityDTO,
  UpdateActivityDataDTO,
  CreateActivityFromQuickTimerDataDTO,
  GetActivitiesByIdsDTO,
  GetCurrentActivitiesQueryDTO,
} from "@to-do-list/shared";
import { pool } from "../shared/index.js";

export const ACTIVITY_RETURNING_COLUMNS = `
  id,
  title,
  description,
  created_at AS "createdAt",
  updated_at AS "updatedAt",
  created_by_id AS "createdById",
  tags,
  last_activity_session_id AS "currentActivitySessionId",
  COALESCE(
    (
      SELECT s.status::text
      FROM activity_sessions s
      WHERE s.id = last_activity_session_id
      LIMIT 1
    ),
    'idle'
  ) AS status,
  active_duration_ms AS "activeDurationMs",
  pause_duration_ms AS "pauseDurationMs"
`;

const MAX_INITIAL_ACTIVE_MS = 24 * 60 * 60 * 1000;

const createActivity = async (
  data: CreateActivityDataDTO,
): Promise<ActivityDTO> => {
  const { title, description, createdById, tags } = data;
  const tagList = tags ?? [];

  const query = `
    INSERT INTO activities (
      title, description, created_by_id, tags, created_at, updated_at,
      active_duration_ms, pause_duration_ms
    )
    VALUES ($1, $2, $3, $4::text[], NOW(), NOW(), 0, 0)
    RETURNING ${ACTIVITY_RETURNING_COLUMNS}
  `;

  const { rows } = await pool.query(query, [
    title,
    description ?? null,
    createdById,
    tagList,
  ]);

  return rows[0];
};

const DEFAULT_ACTIVITY_TITLE = "Quick timer";

const createActivityFromQuickTimer = async (
  data: CreateActivityFromQuickTimerDataDTO,
): Promise<ActivityDTO> => {
  const {
    createdById,
    startedAt: startedAtRaw,
    endedAt: endedAtRaw,
    title = DEFAULT_ACTIVITY_TITLE,
  } = data;
  const tagList: string[] = [];

  const parsedStart = Date.parse(startedAtRaw);
  const parsedEnd = Date.parse(endedAtRaw);

  let clipStart = Number.isFinite(parsedStart) ? parsedStart : parsedEnd;
  let clipEnd = Number.isFinite(parsedEnd) ? parsedEnd : Date.now();
  if (!Number.isFinite(clipStart)) clipStart = clipEnd;
  if (!Number.isFinite(clipEnd)) clipEnd = Date.now();
  if (clipEnd < clipStart) {
    const t = clipStart;
    clipStart = clipEnd;
    clipEnd = t;
  }

  let durationMs = Math.floor(clipEnd - clipStart);
  if (durationMs > MAX_INITIAL_ACTIVE_MS) {
    clipStart = clipEnd - MAX_INITIAL_ACTIVE_MS;
    durationMs = MAX_INITIAL_ACTIVE_MS;
  }

  const startedAtIso = new Date(clipStart).toISOString();
  const endedAtIso = new Date(clipEnd).toISOString();

  if (durationMs <= 0) {
    const { rows } = await pool.query(
      `
      INSERT INTO activities (
        title, description, created_by_id, tags, created_at, updated_at,
        active_duration_ms, pause_duration_ms
      )
      VALUES ($1, $2, $3, $4::text[], NOW(), NOW(), 0, 0)
      RETURNING ${ACTIVITY_RETURNING_COLUMNS}
      `,
      [title, null, createdById, tagList],
    );
    return rows[0];
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: actRows } = await client.query(
      `
      INSERT INTO activities (
        title, description, created_by_id, tags, created_at, updated_at,
        active_duration_ms, pause_duration_ms
      )
      VALUES ($1, $2, $3, $4::text[], NOW(), NOW(), 0, 0)
      RETURNING id
      `,
      [title, null, createdById, tagList],
    );
    const activityId = String(actRows[0].id);

    const { rows: sessRows } = await client.query<{ id: string }>(
      `
      INSERT INTO activity_sessions (
        activity_id, started_at, ended_at, status,
        active_duration_ms, pause_duration_ms, created_at, updated_at
      )
      VALUES ($1::uuid, $2::timestamptz, $3::timestamptz, 'finished', $4::bigint, 0, NOW(), NOW())
      RETURNING id
      `,
      [activityId, startedAtIso, endedAtIso, durationMs],
    );
    const sessionId = String(sessRows[0].id);

    await client.query(
      `
      INSERT INTO activity_session_segments (
        session_id, segment_type, started_at, ended_at, created_at, updated_at
      )
      VALUES ($1::uuid, 'active', $2::timestamptz, $3::timestamptz, NOW(), NOW())
      `,
      [sessionId, startedAtIso, endedAtIso],
    );

    await client.query(
      `
      UPDATE activities
      SET
        last_activity_session_id = $1::uuid,
        active_duration_ms = $2::bigint,
        updated_at = NOW()
      WHERE id = $3::uuid
      `,
      [sessionId, durationMs, activityId],
    );

    const { rows } = await client.query(
      `SELECT ${ACTIVITY_RETURNING_COLUMNS} FROM activities WHERE id = $1::uuid`,
      [activityId],
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
};

const getActivityById = async (
  id: ActivityDTO["id"],
): Promise<ActivityDTO | null> => {
  const query = `
    SELECT ${ACTIVITY_RETURNING_COLUMNS}
    FROM activities
    WHERE id = $1
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] ?? null;
};

const getActivitiesByIds = async (
  data: GetActivitiesByIdsDTO,
): Promise<ActivityDTO[]> => {
  const ids = [...new Set(data.activityIds)];
  if (ids.length === 0) {
    return [];
  }

  const query = `
    SELECT ${ACTIVITY_RETURNING_COLUMNS}
    FROM activities
    WHERE id = ANY($1::uuid[])
    ORDER BY array_position($1::uuid[], id)
  `;

  const { rows } = await pool.query(query, [ids]);
  return rows as ActivityDTO[];
};

const getActivities = async (filters: GetActivitiesDTO) => {
  const {
    createdById,
    tags,
    fromDate,
    toDate,
    search,
    exactTitle,
    page = 0,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const conditions: string[] = [];
  const params: unknown[] = [];

  const add = (sql: string, value?: unknown) => {
    if (value === undefined) return;
    params.push(value);
    conditions.push(sql.replace("?", `$${params.length}`));
  };

  add("created_by_id = ?", createdById);
  add("created_at >= ?", fromDate);
  add("created_at <= ?", toDate);

  if (tags?.length) {
    params.push(tags);
    conditions.push(`tags && $${params.length}::text[]`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(title ILIKE $${params.length} OR description ILIKE $${params.length})`,
    );
  }

  add("title = ?", exactTitle);

  const sortMap: Record<string, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
    title: "title",
  };

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT ${ACTIVITY_RETURNING_COLUMNS}
    FROM activities
    ${where}
    ORDER BY ${sortMap[sortBy]} ${sortOrder.toUpperCase()}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS count
    FROM activities
    ${where}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...params, limit, page * limit]),
    pool.query(countQuery, params),
  ]);

  const totalCount = countResult?.rows?.[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: dataResult.rows as ActivityDTO[],
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages - 1,
      hasPrev: page > 0,
    },
  };
};

type CurrentActivityRow = Record<string, unknown>;

const getCurrentActivities = async (filters: GetCurrentActivitiesQueryDTO) => {
  const {
    createdById,
    fromDate = null,
    toDate = null,
    status,
    page = 0,
    limit = 10,
  } = filters;

  const pagination = (totalCount: number) => {
    const totalPages = Math.ceil(totalCount / limit);
    return {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages - 1,
      hasPrev: page > 0,
    };
  };

  // $2 = fromDate (nullable), $3 = toDate (nullable).
  // When null, the bound is open:
  //   • fromDate IS NULL → no lower bound on segment time
  //   • toDate  IS NULL → no upper bound on segment time
  //
  // Duration clipping:
  //   COALESCE($2, x.started_at)  → if no lower bound, clip start at segment start itself (= no clipping)
  //   COALESCE($3, x.ended_at)    → if no upper bound, clip end at segment end itself (= no clipping)
  //   Open segments (ended_at IS NULL) still return NULL from LEAST/GREATEST so SUM ignores them.
  const clippedDurationFragments = `
      COALESCE((
        SELECT SUM(
          CASE
            WHEN x.segment_type = 'active' THEN
              GREATEST(0,
                EXTRACT(EPOCH FROM (
                  LEAST(x.ended_at, COALESCE($3::timestamptz, x.ended_at))
                  - GREATEST(x.started_at, COALESCE($2::timestamptz, x.started_at))
                )) * 1000
              )
            ELSE 0
          END
        )
        FROM activity_session_segments x
        INNER JOIN activity_sessions sx ON sx.id = x.session_id
        WHERE sx.activity_id = a.id
          AND ($3::timestamptz IS NULL OR x.started_at < $3::timestamptz)
          AND ($2::timestamptz IS NULL OR COALESCE(x.ended_at, NOW()) > $2::timestamptz)
      ), 0)::bigint AS "activeDurationMs",
      COALESCE((
        SELECT SUM(
          CASE
            WHEN x.segment_type = 'pause' THEN
              GREATEST(0,
                EXTRACT(EPOCH FROM (
                  LEAST(x.ended_at, COALESCE($3::timestamptz, x.ended_at))
                  - GREATEST(x.started_at, COALESCE($2::timestamptz, x.started_at))
                )) * 1000
              )
            ELSE 0
          END
        )
        FROM activity_session_segments x
        INNER JOIN activity_sessions sx ON sx.id = x.session_id
        WHERE sx.activity_id = a.id
          AND ($3::timestamptz IS NULL OR x.started_at < $3::timestamptz)
          AND ($2::timestamptz IS NULL OR COALESCE(x.ended_at, NOW()) > $2::timestamptz)
      ), 0)::bigint AS "pauseDurationMs"`;

  // `status` aligns with ActivityDTO.idle | active | paused (idle = no last session).
  if (status === "idle") {
    const idleDataQuery = `
    SELECT
      a.id,
      a.title,
      a.description,
      a.created_at AS "createdAt",
      a.updated_at AS "updatedAt",
      a.created_by_id AS "createdById",
      a.tags,
      a.last_activity_session_id AS "currentActivitySessionId",
      'idle'::text AS status,
      ${clippedDurationFragments}
    FROM activities a
    WHERE a.created_by_id = $1
      AND a.last_activity_session_id IS NULL
    ORDER BY a.updated_at DESC
    LIMIT $4
    OFFSET $5
  `;

    const idleCountQuery = `
    SELECT COUNT(*)::int AS count
    FROM activities a
    WHERE a.created_by_id = $1
      AND a.last_activity_session_id IS NULL
  `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(idleDataQuery, [
        createdById,
        fromDate,
        toDate,
        limit,
        page * limit,
      ]),
      pool.query(idleCountQuery, [createdById]),
    ]);

    const totalCount = countResult.rows[0]?.count ?? 0;

    return {
      data: (dataResult.rows as CurrentActivityRow[]).map((row) => ({
        activity: row,
      })),
      pagination: pagination(totalCount),
    };
  }

  // Last session overlaps the window; map activity rollup active/paused → session row status.
  const overlapSessionStatuses: string[] =
    status === undefined
      ? ["active", "paused"]
      : status === "active"
        ? ["active"]
        : ["paused"];

  const baseParams: unknown[] = [createdById, fromDate, toDate, overlapSessionStatuses];

  const dataQuery = `
    SELECT
      a.id,
      a.title,
      a.description,
      a.created_at AS "createdAt",
      a.updated_at AS "updatedAt",
      a.created_by_id AS "createdById",
      a.tags,
      a.last_activity_session_id AS "currentActivitySessionId",
      s.status::text AS status,
      ${clippedDurationFragments}
    FROM activities a
    INNER JOIN activity_sessions s ON s.id = a.last_activity_session_id
    WHERE a.created_by_id = $1
      AND s.status = ANY($4::text[])
      AND ($3::timestamptz IS NULL OR s.started_at < $3::timestamptz)
      AND ($2::timestamptz IS NULL OR COALESCE(s.ended_at, NOW()) > $2::timestamptz)
    ORDER BY s.started_at DESC, a.updated_at DESC
    LIMIT $5
    OFFSET $6
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS count
    FROM activities a
    INNER JOIN activity_sessions s ON s.id = a.last_activity_session_id
    WHERE a.created_by_id = $1
      AND s.status = ANY($4::text[])
      AND ($3::timestamptz IS NULL OR s.started_at < $3::timestamptz)
      AND ($2::timestamptz IS NULL OR COALESCE(s.ended_at, NOW()) > $2::timestamptz)
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...baseParams, limit, page * limit]),
    pool.query(countQuery, baseParams),
  ]);

  const totalCount = countResult.rows[0]?.count ?? 0;

  return {
    data: (dataResult.rows as CurrentActivityRow[]).map((row) => ({
      activity: row,
    })),
    pagination: pagination(totalCount),
  };
};

const updateActivity = async (
  data: UpdateActivityDataDTO,
): Promise<ActivityDTO> => {
  const { id, title, description, tags } = data;

  const updates: string[] = [];
  const params: unknown[] = [];

  const add = (field: string, value: unknown) => {
    if (value === undefined) return;
    params.push(value);
    updates.push(`${field} = $${params.length}`);
  };

  add("title", title);
  add("description", description);
  if (tags !== undefined) {
    params.push(tags ?? []);
    updates.push(`tags = $${params.length}::text[]`);
  }

  params.push(new Date().toISOString());
  updates.push(`updated_at = $${params.length}`);

  const query = `
    UPDATE activities
    SET ${updates.join(", ")}
    WHERE id = $${params.length + 1}
    RETURNING ${ACTIVITY_RETURNING_COLUMNS}
  `;
  const { rows } = await pool.query(query, [...params, id]);
  return rows[0];
};

const deleteActivity = async (id: ActivityDTO["id"]): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `DELETE FROM activities WHERE id = $1`,
    [id],
  );

  return rowCount === 1;
};

/**
 * Local calendar days where the user has session segment time (not `activities.updated_at`).
 * Expands each segment onto every calendar day its interval touches in local time.
 *
 * Ordered newest-first. `limit` is typically `(page limit) + 1` for pagination.
 *
 * `beforeDay` / `fromDay` / `toDay` are YYYY-MM-DD and compare against calendar_day.
 */
const listGroupedHistoryCalendarDays = async (params: {
  createdById: string;
  beforeDay?: string;
  fromDay?: string;
  toDay?: string;
  limit: number;
  utcOffsetMinutes: number;
}): Promise<{ days: string[] }> => {
  const { createdById, beforeDay, fromDay, toDay, limit, utcOffsetMinutes } =
    params;

  const conditions: string[] = [];
  const baseParams: unknown[] = [createdById, utcOffsetMinutes];

  if (beforeDay) {
    baseParams.push(beforeDay);
    conditions.push(`calendar_day::date < $${baseParams.length}::date`);
  }
  if (fromDay) {
    baseParams.push(fromDay);
    conditions.push(`calendar_day::date >= $${baseParams.length}::date`);
  }
  if (toDay) {
    baseParams.push(toDay);
    conditions.push(`calendar_day::date <= $${baseParams.length}::date`);
  }

  const whereExtra =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const daysQuery = `
    WITH seg_calendar_days AS (
      SELECT DISTINCT to_char(gs.day::date, 'YYYY-MM-DD') AS calendar_day
      FROM activity_session_segments seg
      INNER JOIN activity_sessions s ON s.id = seg.session_id
      INNER JOIN activities a ON a.id = s.activity_id
      CROSS JOIN LATERAL generate_series(
        (seg.started_at + ($2::int * INTERVAL '1 minute'))::date,
        (COALESCE(seg.ended_at, NOW()) + ($2::int * INTERVAL '1 minute'))::date,
        INTERVAL '1 day'
      ) AS gs(day)
      WHERE a.created_by_id = $1
    )
    SELECT calendar_day
    FROM seg_calendar_days
    ${whereExtra}
    ORDER BY calendar_day DESC
    LIMIT $${baseParams.length + 1}
  `;

  const daysResult = await pool.query(daysQuery, [...baseParams, limit]);
  const days: string[] = daysResult.rows.map((r: Record<string, unknown>) =>
    String(r["calendar_day"]),
  );

  return { days };
};

type NonEmptyActivityGroupRow = {
  groupDateStart: string;
  groupDateEnd: string;
};

// Находит непустые временные группы по сегментам пользователя в заданном диапазоне.
const listActivityGroups = async (params: {
  createdById: string;
  groupBy: "day";
  fromDate: string; // inclusive
  toDate: string; // exclusive
  limit: number;
}): Promise<{ groups: NonEmptyActivityGroupRow[] }> => {
  const { createdById, groupBy, fromDate, toDate, limit } = params;

  if (groupBy !== "day") {
    throw new Error(`Unsupported groupBy: ${groupBy}`);
  }

  const query = `
    WITH segment_intervals AS (
      SELECT
        seg.started_at AS started_at,
        COALESCE(seg.ended_at, $3::timestamptz) AS ended_at
      FROM activity_session_segments seg
      INNER JOIN activity_sessions s ON s.id = seg.session_id
      INNER JOIN activities a ON a.id = s.activity_id
      WHERE a.created_by_id = $1
        AND seg.started_at < $3::timestamptz
        AND COALESCE(seg.ended_at, $3::timestamptz) > $2::timestamptz
    ),
    group_days AS (
      SELECT DISTINCT
        gs.day AS group_date_start,
        gs.day + INTERVAL '1 day' AS group_date_end
      FROM segment_intervals si
      CROSS JOIN LATERAL generate_series(
        date_trunc('day', si.started_at),
        date_trunc('day', si.ended_at),
        INTERVAL '1 day'
      ) AS gs(day)
      WHERE gs.day < $3::timestamptz
        AND gs.day + INTERVAL '1 day' > $2::timestamptz
    )
    SELECT
      group_date_start,
      group_date_end
    FROM group_days
    ORDER BY group_date_start DESC
    LIMIT $4
  `;

  const result = await pool.query(query, [
    createdById,
    fromDate,
    toDate,
    limit,
  ]);

  return {
    groups: result.rows.map((row: Record<string, unknown>) => ({
      groupDateStart: new Date(String(row["group_date_start"])).toISOString(),
      groupDateEnd: new Date(String(row["group_date_end"])).toISOString(),
    })),
  };
};

export const activityQueries = {
  createActivity,
  createActivityFromQuickTimer,
  getActivityById,
  getActivitiesByIds,
  listGroupedHistoryCalendarDays,
  getActivities,
  getCurrentActivities,
  updateActivity,
  deleteActivity,
};
