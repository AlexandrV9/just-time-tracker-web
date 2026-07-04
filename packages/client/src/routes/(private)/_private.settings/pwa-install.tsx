import { createFileRoute } from "@tanstack/react-router";
import { PwaInstallPage } from "./_ui/PwaInstallPage";

export const Route = createFileRoute(
  "/(private)/_private/settings/pwa-install",
)({
  component: PwaInstallPage,
});
