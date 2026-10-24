import { createFileRoute } from "@tanstack/react-router";
import { LanguagePage } from "./_ui/LanguagePage";

export const Route = createFileRoute("/(private)/_private/settings/language")({
  component: LanguagePage,
});
