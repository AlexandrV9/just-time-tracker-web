import webpush from "web-push";
import {
  getReminderCopy,
  NOTIFICATION_JOB_TYPES,
  type NotificationJobTypeDTO,
} from "@time-tracker/shared";
import { config } from "../../shared/config/index.js";
import { SqlUserRepository } from "../users/infrastructure/index.js";
import type { NotificationSender } from "./notificationSender.interface.js";
import type { NotificationJob } from "./notifications.types.js";
import { pushSubscriptionsRepository } from "./pushSubscriptions.repository.js";

const userRepository = new SqlUserRepository();

const NOTIFICATION_ICON_PATH = "/icons/logo-192x192.png";
const NOTIFICATION_BADGE_PATH = "/icons/logo-120x120.png";

const isReminderJobType = (type: string): type is NotificationJobTypeDTO =>
  type === NOTIFICATION_JOB_TYPES.ACTIVITY_GOAL_REACHED ||
  type === NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_PAUSE ||
  type === NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_ACTIVITY;

const buildPushPayload = (job: NotificationJob, locale: string) => {
  if (!isReminderJobType(job.type)) {
    return {
      title: job.title,
      body: job.body,
      tag: `notification:${job.id}`,
      url: "/",
      icon: `${config.clientUrl}${NOTIFICATION_ICON_PATH}`,
      badge: `${config.clientUrl}${NOTIFICATION_BADGE_PATH}`,
    };
  }

  const { title, body } = getReminderCopy(locale, job.type, job.title);
  const tag = `reminder:${job.id}:${job.type}`;
  const url = job.activityId ? `/activities/${job.activityId}` : "/activities";

  return {
    title,
    body,
    tag,
    url,
    icon: `${config.clientUrl}${NOTIFICATION_ICON_PATH}`,
    badge: `${config.clientUrl}${NOTIFICATION_BADGE_PATH}`,
    data: {
      url,
      jobId: job.id,
      reminderType: job.type,
      activityId: job.activityId,
    },
  };
};

const isExpiredSubscriptionError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const statusCode =
    "statusCode" in error ? Number(error.statusCode) : undefined;
  return statusCode === 404 || statusCode === 410;
};

export class PushNotificationSender implements NotificationSender {
  private configured = false;

  constructor() {
    if (!config.push.enabled) {
      return;
    }

    webpush.setVapidDetails(
      config.vapid.subject,
      config.vapid.publicKey!,
      config.vapid.privateKey!,
    );
    this.configured = true;
  }

  async send(job: NotificationJob): Promise<void> {
    if (!this.configured) {
      return;
    }

    const user = await userRepository.findById(job.userId);
    if (!user?.pushNotificationsEnabled) {
      return;
    }

    const subscriptions = await pushSubscriptionsRepository.findByUserId(
      job.userId,
    );

    if (subscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify(buildPushPayload(job, user.locale));

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );
        } catch (error) {
          if (isExpiredSubscriptionError(error)) {
            await pushSubscriptionsRepository.deleteByEndpoint(
              subscription.endpoint,
            );
            return;
          }

          throw error;
        }
      }),
    );
  }
}
