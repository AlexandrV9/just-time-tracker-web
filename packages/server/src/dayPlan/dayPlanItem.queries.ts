import type {
  AddDayPlanItemsDataDTO,
  CreateDayPlanItemDataDTO,
  DayPlanItemDTO,
  GetDayPlanItemsDTO,
  UpdateDayPlanItemDataDTO,
} from "@to-do-list/shared";
import { pool } from "../shared/index.js";

export const DAY_PLAN_ITEM_RETURNING_COLUMNS = `
  id,
  created_at AS "createdAt",
  updated_at AS "updatedAt",
  day_plan_id AS "dayPlanId",
  activity_id AS "activityId"
`;

const createDayPlanItem = async (
  data: CreateDayPlanItemDataDTO,
): Promise<DayPlanItemDTO> => {
  const query = `
    INSERT INTO day_plan_items (
      day_plan_id, activity_id, created_at, updated_at
    )
    VALUES ($1::uuid, $2::uuid, NOW(), NOW())
    RETURNING ${DAY_PLAN_ITEM_RETURNING_COLUMNS}
  `;

  const { rows } = await pool.query(query, [data.dayPlanId, data.activityId]);
  return rows[0];
};

const addDayPlanItems = async (
  data: AddDayPlanItemsDataDTO,
): Promise<DayPlanItemDTO[]> => {
  const uniqueActivityIds = [...new Set(data.activityIds)];
  if (uniqueActivityIds.length === 0) {
    return [];
  }

  const valueRows = uniqueActivityIds
    .map((_, i) => `($1::uuid, $${i + 2}::uuid, NOW(), NOW())`)
    .join(", ");

  const query = `
    INSERT INTO day_plan_items (
      day_plan_id, activity_id, created_at, updated_at
    )
    VALUES ${valueRows}
    ON CONFLICT (day_plan_id, activity_id) DO NOTHING
    RETURNING ${DAY_PLAN_ITEM_RETURNING_COLUMNS}
  `;

  const { rows } = await pool.query(query, [
    data.dayPlanId,
    ...uniqueActivityIds,
  ]);
  return rows as DayPlanItemDTO[];
};

const getDayPlanItemById = async (
  id: string,
): Promise<DayPlanItemDTO | null> => {
  const query = `
    SELECT ${DAY_PLAN_ITEM_RETURNING_COLUMNS}
    FROM day_plan_items
    WHERE id = $1::uuid
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] ?? null;
};

const getDayPlanItems = async (filters: GetDayPlanItemsDTO) => {
  const {
    dayPlanId,
    activityId,
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

  add("day_plan_id = ?::uuid", dayPlanId);
  add("activity_id = ?::uuid", activityId);

  const sortMap: Record<string, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
  };

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT ${DAY_PLAN_ITEM_RETURNING_COLUMNS}
    FROM day_plan_items
    ${where}
    ORDER BY ${sortMap[sortBy]} ${sortOrder.toUpperCase()}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS count
    FROM day_plan_items
    ${where}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...params, limit, page * limit]),
    pool.query(countQuery, params),
  ]);

  const totalCount = countResult.rows[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: dataResult.rows as DayPlanItemDTO[],
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

const updateDayPlanItem = async (
  data: UpdateDayPlanItemDataDTO,
): Promise<DayPlanItemDTO | null> => {
  const { id, activityId } = data;

  const updates: string[] = [];
  const params: unknown[] = [];

  if (activityId !== undefined) {
    params.push(activityId);
    updates.push(`activity_id = $${params.length}::uuid`);
  }

  params.push(new Date().toISOString());
  updates.push(`updated_at = $${params.length}`);

  const query = `
    UPDATE day_plan_items
    SET ${updates.join(", ")}
    WHERE id = $${params.length + 1}::uuid
    RETURNING ${DAY_PLAN_ITEM_RETURNING_COLUMNS}
  `;
  const { rows } = await pool.query(query, [...params, id]);
  return rows[0] ?? null;
};

const deleteDayPlanItem = async (id: string): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `DELETE FROM day_plan_items WHERE id = $1::uuid`,
    [id],
  );

  return rowCount === 1;
};

export const dayPlanItemQueries = {
  createDayPlanItem,
  addDayPlanItems,
  getDayPlanItemById,
  getDayPlanItems,
  updateDayPlanItem,
  deleteDayPlanItem,
};
