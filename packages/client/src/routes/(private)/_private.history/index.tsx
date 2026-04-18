import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "./_ui/HistoryPage";

export const Route = createFileRoute("/(private)/_private/history/")({
  component: HistoryPage,
});
