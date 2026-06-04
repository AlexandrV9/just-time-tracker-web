import type { Notification } from "./types";

export const mockNotifications: Notification[] = [
  {
    id: "notification-1",
    title: "Campaign updated",
    description:
      "Your campaign has been updated. Review the changes in the dashboard.",
    status: "info",
    type: "user",
  },
  {
    id: "notification-2",
    title: "User Deleted",
    description:
      "Are you sure you would like to remove this user? This action cannot be undone.",
    status: "warning",
    type: "user",
  },
  {
    id: "notification-3",
    title: "Changes saved",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    status: "success",
    type: "user",
  },
];
