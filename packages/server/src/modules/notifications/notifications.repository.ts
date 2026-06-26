import { pool } from "../../shared/index.js";
import {
  mapNotificationJobRow,
  type CancelPendingJobsInput,
  type NotificationJob,
  type NotificationJobStatus,
  type ScheduleNotificationInput,
} from "./notifications.types.js";

const JOB_RETURNING_COLUMNS = `
  id,
  user_id AS "userId",
  activity_id AS "activityId",
  type,
  title,
  body,
  payload,
  send_at AS "sendAt",
  status,
  sent_at AS "sentAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const toIsoString = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : value;

const assertCancelFilters = (input: CancelPendingJobsInput) => {
  if (!input.activityId && !input.sessionId && !input.types?.length) {
    throw new Error(
      "At least one filter is required to cancel pending notification jobs",
    );
  }
};

const updateJobStatus = async (
  jobId: string,
  status: NotificationJobStatus,
  options?: { setSentAt?: boolean },
): Promise<NotificationJob | null> => {
  const sentAtClause = options?.setSentAt ? "sent_at = NOW()," : "";

  const query = `
    UPDATE notification_jobs
    SET
      status = $2,
      ${sentAtClause}
      updated_at = NOW()
    WHERE id = $1
      AND status = 'pending'
    RETURNING ${JOB_RETURNING_COLUMNS}
  `;

  const { rows } = await pool.query(query, [jobId, status]);
  return rows[0] ? mapNotificationJobRow(rows[0] as NotificationJob) : null;
};

const createJob = async (
  input: ScheduleNotificationInput,
): Promise<NotificationJob> => {
  const query = `
    INSERT INTO notification_jobs (
      user_id,
      activity_id,
      type,
      title,
      body,
      payload,
      send_at,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
    RETURNING ${JOB_RETURNING_COLUMNS}
  `;

  const { rows } = await pool.query(query, [
    input.userId,
    input.activityId ?? null,
    input.type,
    input.title,
    input.body,
    input.payload ?? null,
    toIsoString(input.sendAt),
  ]);

  return mapNotificationJobRow(rows[0] as NotificationJob);
};

const findDuePendingJobs = async (limit: number): Promise<NotificationJob[]> => {
  const query = `
    SELECT ${JOB_RETURNING_COLUMNS}
    FROM notification_jobs
    WHERE status = 'pending'
      AND send_at <= NOW()
    ORDER BY send_at ASC
    LIMIT $1
  `;

  const { rows } = await pool.query(query, [limit]);
  return rows.map((row) => mapNotificationJobRow(row as NotificationJob));
};

const markAsSent = async (jobId: string) =>
  updateJobStatus(jobId, "sent", { setSentAt: true });

const markAsFailed = async (jobId: string) =>
  updateJobStatus(jobId, "failed");

const markAsCanceled = async (jobId: string) =>
  updateJobStatus(jobId, "canceled");

const findById = async (jobId: string): Promise<NotificationJob | null> => {
  const query = `
    SELECT ${JOB_RETURNING_COLUMNS}
    FROM notification_jobs
    WHERE id = $1
  `;

  const { rows } = await pool.query(query, [jobId]);
  return rows[0] ? mapNotificationJobRow(rows[0] as NotificationJob) : null;
};

const cancelPendingJobs = async (
  input: CancelPendingJobsInput,
): Promise<number> => {
  assertCancelFilters(input);

  const conditions = ["status = 'pending'"];
  const params: unknown[] = [];

  if (input.activityId) {
    params.push(input.activityId);
    conditions.push(`activity_id = $${params.length}::uuid`);
  }

  if (input.sessionId) {
    params.push(input.sessionId);
    conditions.push(`payload->>'sessionId' = $${params.length}`);
  }

  if (input.types?.length) {
    params.push(input.types);
    conditions.push(`type = ANY($${params.length}::text[])`);
  }

  const query = `
    UPDATE notification_jobs
    SET status = 'canceled', updated_at = NOW()
    WHERE ${conditions.join(" AND ")}
  `;

  const result = await pool.query(query, params);
  return result.rowCount ?? 0;
};

const findNextPendingSendAt = async (): Promise<string | null> => {
  const query = `
    SELECT send_at AS "sendAt"
    FROM notification_jobs
    WHERE status = 'pending'
    ORDER BY send_at ASC
    LIMIT 1
  `;

  const { rows } = await pool.query(query);
  const row = rows[0] as { sendAt: string } | undefined;
  return row?.sendAt ?? null;
};

export const notificationsRepository = {
  createJob,
  findDuePendingJobs,
  findNextPendingSendAt,
  markAsSent,
  markAsFailed,
  markAsCanceled,
  findById,
  cancelPendingJobs,
};
