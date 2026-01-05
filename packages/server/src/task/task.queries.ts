import type {
  CreateTaskDataDTO,
  GetFreeSlotsQueryDTO,
  GetTasksCountQueryDTO,
  GetTasksQueryDTO,
  TaskDTO,
  TimeSlotDTO,
  UpdateTaskDataDTO,
} from "@to-do-list/shared";
import { pool } from "../shared/index.js";

const createTask = async (data: CreateTaskDataDTO) => {
  const {
    title,
    description,
    status,
    priority,
    createdAt,
    updatedAt,
    startDate,
    endDate,
    actualStartDate,
    actualEndDate,
    createdById,
    tags,
  } = data;

  const query = `
    INSERT INTO tasks (
      title, 
      description, 
      status, 
      priority, 
      created_at, 
      updated_at, 
      start_date, 
      end_date, 
      actual_start_date, 
      actual_end_date, 
      created_by_id, 
      tags, 
      is_deleting
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING 
      id,
      title,
      description,
      status,
      priority,
      created_at as "createdAt",
      updated_at as "updatedAt",
      start_date as "startDate",
      end_date as "endDate",
      actual_start_date as "actualStartDate",
      actual_end_date as "actualEndDate",
      created_by_id as "createdById",
      tags,
      is_deleting as "isDeleting"
  `;

  const { rows } = await pool.query(query, [
    title,
    description,
    status,
    priority,
    createdAt || new Date().toISOString(),
    updatedAt || new Date().toISOString(),
    startDate,
    endDate,
    actualStartDate,
    actualEndDate,
    createdById,
    tags ? JSON.stringify(tags) : null,
    false, // или data.isDeleting ?? false
  ]);

  return rows[0] as {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    startDate?: string | null;
    endDate?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    createdById: string;
    tags?: string[];
    isDeleting: boolean;
  };
};

const getTaskById = async (id: TaskDTO["id"]) => {
  const query = `
    SELECT 
      id,
      title,
      description,
      status,
      priority,
      created_at as "createdAt",
      updated_at as "updatedAt",
      start_date as "startDate",
      end_date as "endDate",
      actual_start_date as "actualStartDate",
      actual_end_date as "actualEndDate",
      created_by_id as "createdById",
      tags,
      is_deleting as "isDeleting"
    FROM tasks 
    WHERE id = $1
  `;

  const { rows } = await pool.query(query, [id]);

  const task = rows[0];

  // 👇 Автоматически парсим JSON
  if (task?.tags && typeof task.tags === "string") {
    try {
      task.tags = JSON.parse(task.tags);
    } catch {
      console.warn("⚠️ Не удалось распарсить tags:", task.tags);
      task.tags = [];
    }
  }

  return task;
};

const getTasks = async (filters: GetTasksQueryDTO) => {
  const {
    status,
    priority,
    createdById,
    tags,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    fromDate,
    toDate,
  } = filters;

  // Сопоставление полей сортировки (безопасно)
  const sortFieldMap: Record<string, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
    title: "title",
    priority: "priority",
    status: "status",
    startDate: "start_date",
    endDate: "end_date",
  };
  const sortField = sortFieldMap[sortBy] || "created_at";
  const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Условия WHERE
  const conditions: string[] = ["is_deleting = false"];
  const params: any[] = [];

  // Универсальная функция добавления фильтров
  const addFilter = (sql: string, ...values: any[]) => {
    values.forEach((value) => {
      params.push(value);
      sql = sql.replace("?", `$${params.length}`);
    });
    conditions.push(sql);
  };

  // Применяем фильтры
  if (status) addFilter("status = ?", status);
  if (priority) addFilter("priority = ?", priority);
  if (createdById) addFilter("created_by_id = ?", createdById);
  if (tags?.length) addFilter("tags ?| ?", tags); // tags как string[]
  if (search)
    addFilter(
      "(title ILIKE ? OR description ILIKE ?)",
      `%${search}%`,
      `%${search}%`
    );
  if (fromDate) addFilter("end_date > ?", fromDate);
  if (toDate) addFilter("start_date < ?", toDate);

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // Основной SELECT
  const query = `
    SELECT 
      id,
      title,
      description,
      status,
      priority,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      start_date AS "startDate",
      end_date AS "endDate",
      actual_start_date AS "actualStartDate",
      actual_end_date AS "actualEndDate",
      created_by_id AS "createdById",
      tags,
      is_deleting AS "isDeleting"
    FROM tasks
    ${whereClause}
    ORDER BY ${sortField} ${order}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;
  const queryParams = [...params, limit, (page - 1) * limit];

  // Запускаем SELECT и COUNT параллельно
  const [dataResult, countResult] = await Promise.all([
    pool.query(query, queryParams),
    pool.query(
      `SELECT COUNT(*)::int AS count FROM tasks ${whereClause}`,
      params
    ),
  ]);

  const totalCount = countResult.rows[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Парсим JSON теги
  const tasks = dataResult.rows.map((task) => {
    if (typeof task.tags === "string") {
      try {
        task.tags = JSON.parse(task.tags);
      } catch {
        console.warn("⚠️ Не удалось распарсить tags:", task.tags);
        task.tags = [];
      }
    }
    return task;
  });

  return {
    data: tasks as TaskDTO[],
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

const updateTask = async (data: UpdateTaskDataDTO) => {
  const {
    id,
    title,
    description,
    status,
    priority,
    updatedAt,
    startDate,
    endDate,
    actualStartDate,
    actualEndDate,
    tags,
    isDeleting,
  } = data;

  // Динамическое построение SET части запроса
  const updates: string[] = [];
  const params: any[] = [];

  const addUpdate = (field: string, value: any, dbFieldName?: string) => {
    if (value !== undefined) {
      updates.push(`${dbFieldName || field} = $${params.length + 1}`);
      params.push(value);
    }
  };

  addUpdate("title", title);
  addUpdate("description", description);
  addUpdate("status", status);
  addUpdate("priority", priority);
  addUpdate("updatedAt", updatedAt || new Date().toISOString(), "updated_at");
  addUpdate("startDate", startDate, "start_date");
  addUpdate("endDate", endDate, "end_date");
  addUpdate("actualStartDate", actualStartDate, "actual_start_date");
  addUpdate("actualEndDate", actualEndDate, "actual_end_date");
  addUpdate("tags", tags ? JSON.stringify(tags) : null);
  addUpdate("isDeleting", isDeleting, "is_deleting");

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  const query = `
    UPDATE tasks 
    SET ${updates.join(", ")}
    WHERE id = $${params.length + 1}
    RETURNING 
      id,
      title,
      description,
      status,
      priority,
      created_at as "createdAt",
      updated_at as "updatedAt",
      start_date as "startDate",
      end_date as "endDate",
      actual_start_date as "actualStartDate",
      actual_end_date as "actualEndDate",
      created_by_id as "createdById",
      tags,
      is_deleting as "isDeleting"
  `;

  const { rows } = await pool.query(query, [...params, id]);

  if (rows.length === 0) {
    throw new Error("Task not found");
  }

  const task = rows[0];

  // Парсим JSON теги
  if (task?.tags && typeof task.tags === "string") {
    try {
      task.tags = JSON.parse(task.tags);
    } catch {
      console.warn("⚠️ Не удалось распарсить tags:", task.tags);
      task.tags = [];
    }
  }

  return task as {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    startDate?: string | null;
    endDate?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    createdById: string;
    tags?: string[];
    isDeleting: boolean;
  };
};

const deleteTask = async (id: TaskDTO["id"]) => {
  const query = `
    UPDATE tasks 
    SET is_deleting = true, updated_at = $2
    WHERE id = $1
    RETURNING 
      id,
      title,
      description,
      status,
      priority,
      created_at as "createdAt",
      updated_at as "updatedAt",
      start_date as "startDate",
      end_date as "endDate",
      actual_start_date as "actualStartDate",
      actual_end_date as "actualEndDate",
      created_by_id as "createdById",
      tags,
      is_deleting as "isDeleting"
  `;

  const { rows } = await pool.query(query, [id, new Date().toISOString()]);

  if (rows.length === 0) {
    throw new Error("Task not found");
  }

  const task = rows[0];

  // Парсим JSON теги
  if (task?.tags && typeof task.tags === "string") {
    try {
      task.tags = JSON.parse(task.tags);
    } catch {
      console.warn("⚠️ Не удалось распарсить tags:", task.tags);
      task.tags = [];
    }
  }

  return task as {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    startDate?: string | null;
    endDate?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    createdById: string;
    tags?: string[];
    isDeleting: boolean;
  };
};

const hardDeleteTask = async (id: string) => {
  const query = "DELETE FROM tasks WHERE id = $1 RETURNING id";
  const { rows } = await pool.query(query, [id]);

  if (rows.length === 0) {
    throw new Error("Task not found");
  }

  return { id: rows[0].id, deleted: true };
};

const getFreeSlots = async ({
  startDate,
  endDate,
  excludeTaskIds,
}: GetFreeSlotsQueryDTO) => {
  const query = `
    SELECT 
      start_date AS "startDate",
      end_date AS "endDate"
    FROM tasks
    WHERE 
      is_deleting = false
      AND start_date < $2
      AND end_date > $1
      AND (
        $3::uuid[] IS NULL
        OR id != ALL($3)
      )
    ORDER BY start_date ASC
  `;

  const { rows: tasks } = await pool.query(query, [
    startDate,
    endDate,
    excludeTaskIds?.length ? excludeTaskIds : null,
  ]);

  const rangeStart = new Date(startDate).getTime();
  const rangeEnd = new Date(endDate).getTime();

  if (tasks.length === 0) {
    return [{ startDate, endDate }];
  }

  const freeSlots: TimeSlotDTO[] = [];
  let cursor = rangeStart;

  for (const task of tasks) {
    const taskStart = Math.max(new Date(task.startDate).getTime(), rangeStart);
    const taskEnd = Math.min(new Date(task.endDate).getTime(), rangeEnd);

    if (cursor < taskStart) {
      freeSlots.push({
        startDate: new Date(cursor).toISOString(),
        endDate: new Date(taskStart).toISOString(),
      });
    }

    cursor = Math.max(cursor, taskEnd);
  }

  if (cursor < rangeEnd) {
    freeSlots.push({
      startDate: new Date(cursor).toISOString(),
      endDate: new Date(rangeEnd).toISOString(),
    });
  }

  return freeSlots;
};

const getTasksCount = async ({
  fromDate,
  toDate,
}: GetTasksCountQueryDTO): Promise<{ count: number }> => {
  const query = `
    SELECT 
      COUNT(*)::int AS count
    FROM tasks
    WHERE 
      is_deleting = false
      AND start_date < $2
      AND end_date > $1
  `;

  const { rows } = await pool.query(query, [fromDate, toDate]);

  return {
    count: rows[0]?.count ?? 0,
  };
};

export const taskQueries = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  hardDeleteTask,
  getFreeSlots,
  getTasksCount,
};
