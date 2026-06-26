import type { NotificationSender } from "./notificationSender.interface.js";
import type { NotificationJob } from "./notifications.types.js";

export class ConsoleNotificationSender implements NotificationSender {
  async send(job: NotificationJob): Promise<void> {
    console.log(
      [
        "Notification sent:",
        `jobId=${job.id}`,
        `userId=${job.userId}`,
        `type=${job.type}`,
        `title=${job.title}`,
      ].join("\n"),
    );
  }
}
