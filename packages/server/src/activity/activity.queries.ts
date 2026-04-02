import type {
  CreateActivityDataDTO,
  GetActivitiesDTO,
  ActivityDTO,
  UpdateActivityDataDTO,
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

const titleExistsForUser = async (
  createdById: string,
  title: string,
  excludeId?: string | null,
): Promise<boolean> => {
  const query = excludeId
    ? `
      SELECT 1 FROM activities
      WHERE created_by_id = $1 AND title = $2 AND id <> $3::uuid
      LIMIT 1
    `
    : `
      SELECT 1 FROM activities
      WHERE created_by_id = $1 AND title = $2
      LIMIT 1
    `;

  const params = excludeId
    ? [createdById, title, excludeId]
    : [createdById, title];

  const { rows } = await pool.query(query, params);
  return rows.length > 0;
};

const resolveUniqueTitleForUser = async (
  createdById: string,
  desiredTitle: string,
  excludeId?: string | null,
): Promise<string> => {
  const base =
    desiredTitle.trim().length > 0 ? desiredTitle.trim() : "Unnamed Activity";

  let candidate = base;
  let n = 2;

  while (await titleExistsForUser(createdById, candidate, excludeId)) {
    candidate = `${base} (${n})`;
    n += 1;
  }

  return candidate;
};

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

  const totalCount = countResult.rows[0]?.count ?? 0;
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

export const activityQueries = {
  createActivity,
  getActivityById,
  getActivities,
  updateActivity,
  deleteActivity,
  titleExistsForUser,
  resolveUniqueTitleForUser,
};
