import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "./_ui/ProfilePage";

export const Route = createFileRoute("/(private)/_private/settings/profile")({
  component: ProfilePage,
});
