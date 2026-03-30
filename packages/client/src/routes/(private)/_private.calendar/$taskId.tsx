import { createFileRoute } from "@tanstack/react-router";
import { TaskPage } from "./_ui/TaskPage";

export const Route = createFileRoute("/(private)/_private/calendar/$taskId")({
  component: TaskPage,
});
