import { createFileRoute } from "@tanstack/react-router";
import { NotificationsSettingsPage } from "./_ui/NotificationsSettingsPage";

export const Route = createFileRoute("/(private)/_private/settings/notifications")(
  {
    component: NotificationsSettingsPage,
  },
);
