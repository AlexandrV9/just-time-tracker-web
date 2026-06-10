import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { SecurityPage } from "./_ui/SecurityPage";

export const Route = createFileRoute("/(private)/_private/settings/security")({
  validateSearch: z.object({
    linked: z.string().optional().catch(undefined),
    error: z.string().optional().catch(undefined),
  }),
  component: SecurityPage,
});
