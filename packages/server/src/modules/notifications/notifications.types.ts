import type { NotificationJobTypeDTO } from "@time-tracker/shared";
export { NOTIFICATION_JOB_TYPES } from "@time-tracker/shared";

export const NOTIFICATION_JOB_STATUSES = [
  "pending",
  "sent",
  "failed",
  "canceled",
] as const;

export type NotificationJobType = NotificationJobTypeDTO;

export type NotificationJobStatus =
  (typeof NOTIFICATION_JOB_STATUSES)[number];

export type NotificationJob = {
  id: string;
  userId: string;
  activityId: string | null;
  type: NotificationJobType | string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  sendAt: string;
  status: NotificationJobStatus;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleNotificationInput = {
  userId: string;
  activityId?: string | null;
  type: NotificationJobType | string;
  title: string;
  body: string;
  payload?: Record<string, unknown> | null;
  sendAt: Date | string;
};

export type CancelPendingJobsInput = {
  activityId?: string;
  sessionId?: string;
  types?: string[];
};

export type PushSubscription = {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
  updatedAt: string;
};

export type PushSubscriptionRow = {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePushSubscriptionInput = {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export const mapNotificationJobRow = (row: NotificationJob): NotificationJob =>
  row;

export const mapPushSubscriptionRow = (
  row: PushSubscriptionRow,
): PushSubscription => ({
  id: row.id,
  userId: row.userId,
  endpoint: row.endpoint,
  p256dh: row.p256dh,
  auth: row.auth,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
