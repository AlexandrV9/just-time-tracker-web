export type NotificationStatus = "info" | "warning" | "success";

export type NotificationType = "system" | "user";

export type Notification = {
  id: string;
  title: string;
  description: string;
  status: NotificationStatus;
  type: NotificationType;
};
