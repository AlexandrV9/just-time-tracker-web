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
  currentSegmentId:
    row.currentSegmentId === null || row.currentSegmentId === undefined
      ? null
      : String(row.currentSegmentId),
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

const deleteActivitySessionById = async (id: string): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `DELETE FROM activity_sessions WHERE id = $1`,
    [id],
  );
  return rowCount ? rowCount > 0 : false;
};

type ActivityGroupBy = "day" | "week" | "month";

type ActivityGroupRangeDTO = {
  groupDateStart: string;

  groupDateEnd: string;
};

const GROUP_CONFIG = {
  day: {
    trunc: "day",

    step: "1 day",
  },

  week: {
    trunc: "week",

    step: "1 week",
  },

  month: {
    trunc: "month",

    step: "1 month",
  },
} as const;

export const listNonEmptyActivityGroups = async (params: {
  createdById: string;
  groupBy: ActivityGroupBy;
  fromDate: string;
  toDate: string;
  limit: number;
}): Promise<{ groups: ActivityGroupRangeDTO[] }> => {
  const { createdById, groupBy, fromDate, toDate, limit } = params;

  const config = GROUP_CONFIG[groupBy];

  const query = `
    WITH segment_intervals AS (
      SELECT
        seg.started_at,
        COALESCE(seg.ended_at, $3::timestamp) AS ended_at
      FROM activity_session_segments seg
      INNER JOIN activity_sessions s ON s.id = seg.session_id
      INNER JOIN activities a ON a.id = s.activity_id
      WHERE a.created_by_id = $1
        AND seg.started_at < $3::timestamp
        AND COALESCE(seg.ended_at, $3::timestamp) > $2::timestamp
    ),
    non_empty_groups AS (
      SELECT DISTINCT
        date_trunc('${config.trunc}', gs.bucket)::timestamp AS group_date_start,
        (
          date_trunc('${config.trunc}', gs.bucket)::timestamp
          + INTERVAL '${config.step}'
        ) AS group_date_end
      FROM segment_intervals si
      CROSS JOIN LATERAL generate_series(
        date_trunc('${config.trunc}', si.started_at),
        date_trunc('${config.trunc}', si.ended_at - INTERVAL '1 microsecond'),
        INTERVAL '${config.step}'
      ) AS gs(bucket)
      WHERE gs.bucket < $3::timestamp
        AND gs.bucket + INTERVAL '${config.step}' > $2::timestamp
    )
    SELECT
      to_char(group_date_start, 'YYYY-MM-DD"T"HH24:MI:SS.MS') AS group_date_start,
      to_char(group_date_end, 'YYYY-MM-DD"T"HH24:MI:SS.MS') AS group_date_end
    FROM non_empty_groups
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
      groupDateStart: String(row["group_date_start"]),
      groupDateEnd: String(row["group_date_end"]),
    })),
  };
};

type TrackedTimeTotalsDTO = {
  activeDurationMs: number;
  pauseDurationMs: number;
};

// Считает суммарное время внутри интервала [fromDate, toDate)
export const getTotalTimeInRange = async (params: {
  createdById: string;
  fromDate: string;
  toDate: string;
}): Promise<TrackedTimeTotalsDTO> => {
  const { createdById, fromDate, toDate } = params;

  const query = `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN seg.type = 'active' THEN
              EXTRACT(
                EPOCH FROM (
                  LEAST(COALESCE(seg.ended_at, $3::timestamp), $3::timestamp)
                  -
                  GREATEST(seg.started_at, $2::timestamp)
                )
              ) * 1000
            ELSE 0
          END
        ),
        0
      ) AS active_duration_ms,
      COALESCE(
        SUM(
          CASE
            WHEN seg.type = 'pause' THEN
              EXTRACT(
                EPOCH FROM (
                  LEAST(COALESCE(seg.ended_at, $3::timestamp), $3::timestamp)
                  -
                  GREATEST(seg.started_at, $2::timestamp)
                )
              ) * 1000
            ELSE 0
          END
        ),
        0
      ) AS pause_duration_ms
    FROM activity_session_segments seg
    INNER JOIN activity_sessions s ON s.id = seg.session_id
    INNER JOIN activities a ON a.id = s.activity_id
    WHERE a.created_by_id = $1
      AND seg.started_at < $3::timestamp
      AND COALESCE(seg.ended_at, $3::timestamp) > $2::timestamp
  `;

  const result = await pool.query(query, [createdById, fromDate, toDate]);
  const row = result.rows[0] as Record<string, unknown> | undefined;

  return {
    activeDurationMs: Math.floor(Number(row?.["active_duration_ms"] ?? 0)),
    pauseDurationMs: Math.floor(Number(row?.["pause_duration_ms"] ?? 0)),
  };
};

type ActivityTimeInRangeDTO = {
  activityId: string;
  activeDurationMs: number;
  pauseDurationMs: number;
};

// Получить активности внутри интервала [fromDate, toDate) с их activeDurationMs / pauseDurationMs именно за этот интервал.
export const listActivityTimeItemsInRange = async (params: {
  createdById: string;
  fromDate: string; // inclusive
  toDate: string; // exclusive
  limit: number;
  offset?: number;
}): Promise<{
  items: ActivityTimeInRangeDTO[];
}> => {
  const { createdById, fromDate, toDate, limit, offset = 0 } = params;
  const query = `
    WITH activity_durations AS (
      SELECT
        a.id AS activity_id,
        COALESCE(
          SUM(
            CASE
              WHEN seg.type = 'active' THEN
                EXTRACT(
                  EPOCH FROM (
                    LEAST(COALESCE(seg.ended_at, $3::timestamp), $3::timestamp)
                    -
                    GREATEST(seg.started_at, $2::timestamp)
                  )
                ) * 1000
              ELSE 0
            END
          ),
          0
        ) AS active_duration_ms,
        COALESCE(
          SUM(
            CASE
              WHEN seg.type = 'pause' THEN
                EXTRACT(
                  EPOCH FROM (
                    LEAST(COALESCE(seg.ended_at, $3::timestamp), $3::timestamp)
                    -
                    GREATEST(seg.started_at, $2::timestamp)
                  )
                ) * 1000
              ELSE 0
            END
          ),
          0
        ) AS pause_duration_ms,
        MAX(seg.started_at) AS last_tracked_at
      FROM activity_session_segments seg
      INNER JOIN activity_sessions s ON s.id = seg.session_id
      INNER JOIN activities a ON a.id = s.activity_id
      WHERE a.created_by_id = $1
        AND seg.started_at < $3::timestamp
        AND COALESCE(seg.ended_at, $3::timestamp) > $2::timestamp
      GROUP BY a.id
    )
    SELECT
      activity_id,
      active_duration_ms,
      pause_duration_ms
    FROM activity_durations
    WHERE active_duration_ms + pause_duration_ms > 0
    ORDER BY last_tracked_at DESC, activity_id ASC
    LIMIT $4
    OFFSET $5
  `;

  const result = await pool.query(query, [
    createdById,
    fromDate,
    toDate,
    limit,
    offset,
  ]);

  return {
    items: result.rows.map((row: Record<string, unknown>) => ({
      activityId: String(row["activity_id"]),
      activeDurationMs: Math.floor(Number(row["active_duration_ms"] ?? 0)),
      pauseDurationMs: Math.floor(Number(row["pause_duration_ms"] ?? 0)),
    })),
  };
};

export const activitySessionQueries = {
  createActivitySession,
  getActivitySessionById,
  getActivitySessionsByActivityId,
  updateActivitySession,
  deleteActivitySessionById,
  listNonEmptyActivityGroups,
  getTotalTimeInRange,
  listActivityTimeItemsInRange,
};
