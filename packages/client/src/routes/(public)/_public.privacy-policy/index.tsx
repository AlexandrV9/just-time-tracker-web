import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyPage } from "./_ui/PrivacyPolicyPage";

export const Route = createFileRoute("/(public)/_public/privacy-policy/")({
  component: PrivacyPolicyPage,
});
