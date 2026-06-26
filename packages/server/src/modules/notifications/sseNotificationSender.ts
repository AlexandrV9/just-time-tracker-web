import type { NotificationJobTypeDTO } from "@time-tracker/shared";
import { activityEventsHub } from "../../activity/activityEvents.hub.js";
import type { NotificationSender } from "./notificationSender.interface.js";
import type { NotificationJob } from "./notifications.types.js";

export class SseNotificationSender implements NotificationSender {
  async send(job: NotificationJob): Promise<void> {
    activityEventsHub.publish(job.userId, {
      type: "reminder",
      data: {
        jobId: job.id,
        reminderType: job.type as NotificationJobTypeDTO,
        activityId: job.activityId,
        title: job.title,
        body: job.body,
      },
    });
  }
}
