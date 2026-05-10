import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { HistoryPage } from "./_ui/HistoryPage";

const historySearchSchema = z.object({
  highlight: z.string().optional(),
  highlightDate: z.string().optional(),
});

export const Route = createFileRoute("/(private)/_private/history/")({
  validateSearch: zodValidator(historySearchSchema),
  component: HistoryPage,
});
