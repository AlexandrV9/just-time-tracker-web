import type { NotificationJob } from "./notifications.types.js";

export interface NotificationSender {
  send(job: NotificationJob): Promise<void>;
}
