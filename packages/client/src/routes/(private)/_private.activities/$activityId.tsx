import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_private/activities/$activityId",
)({
  component: () => <Outlet />,
});
