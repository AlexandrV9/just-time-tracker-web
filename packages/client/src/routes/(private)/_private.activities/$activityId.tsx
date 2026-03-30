import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "./_ui/ActivityPage";

export const Route = createFileRoute(
  "/(private)/_private/activities/$activityId",
)({
  component: ActivityPage,
});
