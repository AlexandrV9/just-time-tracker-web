import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { TasksPage } from "./_ui/TasksPage";
import z from "zod";

const tasksSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/(private)/_private/tasks/")({
  validateSearch: zodValidator(tasksSearchSchema),
  component: TasksPage,
});
