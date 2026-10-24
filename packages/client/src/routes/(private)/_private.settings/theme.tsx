import { createFileRoute } from "@tanstack/react-router";
import { ThemePage } from "./_ui/ThemePage";

export const Route = createFileRoute("/(private)/_private/settings/theme")({
  component: ThemePage,
});
