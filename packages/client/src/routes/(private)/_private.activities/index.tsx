import { createFileRoute } from "@tanstack/react-router";
import { ActivitiesPage } from "./_ui/ActivitiesPage";

export const Route = createFileRoute("/(private)/_private/activities/")({
  component: ActivitiesPage,
});
