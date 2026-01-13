import type {
  CreateTimeEntryDataDTO,
  GetTimeEntriesQueryDTO,
  TimeEntryDTO,
  UpdateTimeEntryDataDTO,
} from "@to-do-list/shared";
import { pool } from "../shared/index.js";

const createTimeEntry = async (
  data: CreateTimeEntryDataDTO
): Promise<TimeEntryDTO> => {
  const {
    title,
    description,
    startDate,
    endDate,
    createdById,
    tags,
    showInCalendar,
  } = data;

  const query = `
    INSERT INTO time_entries (
      title,
      description,
      start_date,
      end_date,
      created_by_id,
      tags,
      show_in_calendar,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NULL)
    RETURNING
      id,
      title,
      description,
      start_date AS "startDate",
      end_date AS "endDate",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      created_by_id AS "createdById",
      tags,
      show_in_calendar AS "showInCalendar"
  `;

  const { rows } = await pool.query(query, [
    title,
    description ?? null,
    startDate ?? null,
    endDate ?? null,
    createdById,
    tags ?? null,
    showInCalendar,
  ]);

  return rows[0];
};

const getTimeEntryById = async (
  id: TimeEntryDTO["id"]
): Promise<TimeEntryDTO | null> => {
  const query = `
    SELECT
      id,
      title,
      description,
      start_date AS "startDate",
      end_date AS "endDate",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      created_by_id AS "createdById",
      tags,
      show_in_calendar AS "showInCalendar"
    FROM time_entries
    WHERE id = $1
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] ?? null;
};

const getTimeEntries = async (filters: GetTimeEntriesQueryDTO) => {
  const {
    createdById,
    tags,
    fromDate,
    toDate,
    search,
    page = 1,
    limit = 10,
    sortBy = "startDate",
    sortOrder = "desc",
  } = filters;

  const conditions: string[] = [];
  const params: any[] = [];

  const add = (sql: string, value?: any) => {
    if (value === undefined) return;
    params.push(value);
    conditions.push(sql.replace("?", `$${params.length}`));
  };

  add("created_by_id = ?", createdById);
  add("end_date >= ?", fromDate);
  add("start_date <= ?", toDate);

  if (tags?.length) {
    params.push(JSON.stringify(tags.map((t) => t.id)));
    conditions.push(`tags::jsonb ?| $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(title ILIKE $${params.length} OR description ILIKE $${params.length})`
    );
  }

  const sortMap: Record<string, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
    title: "title",
    startDate: "start_date",
    endDate: "end_date",
  };

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT
      id,
      title,
      description,
      start_date AS "startDate",
      end_date AS "endDate",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      created_by_id AS "createdById",
      tags,
      show_in_calendar AS "showInCalendar"
    FROM time_entries
    ${where}
    ORDER BY ${sortMap[sortBy]} ${sortOrder.toUpperCase()}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS count
    FROM time_entries
    ${where}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...params, limit, (page - 1) * limit]),
    pool.query(countQuery, params),
  ]);

  const totalCount = countResult.rows[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: dataResult.rows as TimeEntryDTO[],
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

const updateTimeEntry = async (
  data: UpdateTimeEntryDataDTO
): Promise<TimeEntryDTO> => {
  const { id, title, description, startDate, endDate, tags } = data;

  const updates: string[] = [];
  const params: any[] = [];

  const add = (field: string, value: any) => {
    if (value === undefined) return;
    params.push(value);
    updates.push(`${field} = $${params.length}`);
  };

  add("title", title);
  add("description", description);
  add("start_date", startDate);
  add("end_date", endDate);
  add("tags", tags ?? null);

  params.push(new Date().toISOString());
  updates.push(`updated_at = $${params.length}`);

  const query = `
    UPDATE time_entries
    SET ${updates.join(", ")}
    WHERE id = $${params.length + 1}
    RETURNING
      id,
      title,
      description,
      start_date AS "startDate",
      end_date AS "endDate",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      created_by_id AS "createdById",
      tags,
      show_in_calendar AS "showInCalendar"
  `;

  const { rows } = await pool.query(query, [...params, id]);
  return rows[0];
};

const deleteTimeEntry = async (id: TimeEntryDTO["id"]): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `
    DELETE FROM time_entries
    WHERE id = $1
    `,
    [id]
  );

  return rowCount === 1;
};

export const timeEntryQueries = {
  createTimeEntry,
  getTimeEntryById,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
};
