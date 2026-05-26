import { createFileRoute } from "@tanstack/react-router";
import { TermsOfServicePage } from "./_ui/TermsOfServicePage";

export const Route = createFileRoute("/(public)/_public/terms-of-service/")({
  component: TermsOfServicePage,
});
