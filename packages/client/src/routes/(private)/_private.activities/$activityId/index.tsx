import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { ActivityPage } from "../_ui/ActivityPage";

const activityDetailSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute(
  "/(private)/_private/activities/$activityId/",
)({
  validateSearch: zodValidator(activityDetailSearchSchema),
  component: ActivityPage,
});
