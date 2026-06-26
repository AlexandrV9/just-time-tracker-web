import { createFileRoute } from "@tanstack/react-router";
import { ActivitySettingsPage } from "./_ui/ActivitySettingsPage";

export const Route = createFileRoute(
  "/(private)/_private/activities/$activityId/settings",
)({
  component: ActivitySettingsPage,
});
