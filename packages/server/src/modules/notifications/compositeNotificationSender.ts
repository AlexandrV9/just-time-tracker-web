import type { NotificationSender } from "./notificationSender.interface.js";
import type { NotificationJob } from "./notifications.types.js";

export class CompositeNotificationSender implements NotificationSender {
  private readonly senders: NotificationSender[];

  constructor(senders: NotificationSender[]) {
    this.senders = senders;
  }

  async send(job: NotificationJob): Promise<void> {
    const errors: unknown[] = [];

    for (const sender of this.senders) {
      try {
        await sender.send(job);
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length === this.senders.length) {
      throw errors[0] instanceof Error
        ? errors[0]
        : new Error("All notification senders failed");
    }
  }
}
