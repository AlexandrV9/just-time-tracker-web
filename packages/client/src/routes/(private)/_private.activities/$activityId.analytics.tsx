import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { ActivityAnalyticsPage } from "./_ui/ActivityAnalyticsPage";

const activityAnalyticsSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute(
  "/(private)/_private/activities/$activityId/analytics",
)({
  validateSearch: zodValidator(activityAnalyticsSearchSchema),
  component: ActivityAnalyticsPage,
});
