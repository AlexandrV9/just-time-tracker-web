import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { CalendarPage } from "./_ui/CalendarPage";
import z from "zod";

const tasksSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/(private)/_private/calendar/")({
  validateSearch: zodValidator(tasksSearchSchema),
  component: CalendarPage,
});
