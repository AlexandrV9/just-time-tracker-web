import type { WithCreatedById } from "../shared/auth/with-created-by-id.js";
import type {
  CreateDayPlanDataDTO,
  DayActivitiesByDateDTO,
  DayPlanDTO,
  GetDayPlansByRangeDTO,
  GetDayPlansDTO,
  UpdateDayPlanDataDTO,
} from "@time-tracker/shared";
import { pool } from "../shared/index.js";

export const DAY_PLAN_RETURNING_COLUMNS = `
  id,
  created_at AS "createdAt",
  updated_at AS "updatedAt",
  created_by_id AS "createdById",
  date::text AS date
`;

const createDayPlan = async (
  data: WithCreatedById<CreateDayPlanDataDTO>,
): Promise<DayPlanDTO> => {
  const query = `
    INSERT INTO day_plans (created_by_id, date, created_at, updated_at)
    VALUES ($1, $2::date, NOW(), NOW())
    RETURNING ${DAY_PLAN_RETURNING_COLUMNS}
  `;

  const { rows } = await pool.query(query, [data.createdById, data.date]);
  return rows[0];
};

const getDayPlanById = async (id: string): Promise<DayPlanDTO | null> => {
  const query = `
    SELECT ${DAY_PLAN_RETURNING_COLUMNS}
    FROM day_plans
    WHERE id = $1::uuid
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] ?? null;
};

const getDayPlans = async (filters: WithCreatedById<GetDayPlansDTO>) => {
  const {
    createdById,
    date,
    page = 0,
    limit = 10,
    sortBy = "date",
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
  add("date = ?::date", date);

  const sortMap: Record<string, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
    date: "date",
  };

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT ${DAY_PLAN_RETURNING_COLUMNS}
    FROM day_plans
    ${where}
    ORDER BY ${sortMap[sortBy]} ${sortOrder.toUpperCase()}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS count
    FROM day_plans
    ${where}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...params, limit, page * limit]),
    pool.query(countQuery, params),
  ]);

  const totalCount = countResult.rows[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: dataResult.rows as DayPlanDTO[],
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

const getDayPlansByRange = async (
  filters: WithCreatedById<GetDayPlansByRangeDTO>,
): Promise<DayActivitiesByDateDTO[]> => {
  const { createdById, fromDate, toDate } = filters;

  const query = `
    SELECT
      dp.date::text AS date,
      COALESCE(
        json_agg(
          json_build_object('name', a.title)
          ORDER BY dpi.created_at
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) AS activities
    FROM day_plans dp
    LEFT JOIN day_plan_items dpi ON dpi.day_plan_id = dp.id
    LEFT JOIN activities a ON a.id = dpi.activity_id
    WHERE dp.created_by_id = $1
      AND dp.date >= $2::date
      AND dp.date <= $3::date
    GROUP BY dp.date
    HAVING COUNT(a.id) > 0
    ORDER BY dp.date
  `;

  const { rows } = await pool.query(query, [createdById, fromDate, toDate]);
  return rows as DayActivitiesByDateDTO[];
};

const updateDayPlan = async (
  data: UpdateDayPlanDataDTO,
): Promise<DayPlanDTO | null> => {
  const { id, date } = data;

  const updates: string[] = [];
  const params: unknown[] = [];

  if (date !== undefined) {
    params.push(date);
    updates.push(`date = $${params.length}::date`);
  }

  params.push(new Date().toISOString());
  updates.push(`updated_at = $${params.length}`);

  const query = `
    UPDATE day_plans
    SET ${updates.join(", ")}
    WHERE id = $${params.length + 1}::uuid
    RETURNING ${DAY_PLAN_RETURNING_COLUMNS}
  `;
  const { rows } = await pool.query(query, [...params, id]);
  return rows[0] ?? null;
};

const deleteDayPlan = async (id: string): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `DELETE FROM day_plans WHERE id = $1::uuid`,
    [id],
  );

  return rowCount === 1;
};

export const dayPlanQueries = {
  createDayPlan,
  getDayPlanById,
  getDayPlans,
  getDayPlansByRange,
  updateDayPlan,
  deleteDayPlan,
};
