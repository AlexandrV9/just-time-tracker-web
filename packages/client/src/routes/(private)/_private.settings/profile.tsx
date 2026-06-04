import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { ProfilePage } from "./_ui/ProfilePage";

export const Route = createFileRoute("/(private)/_private/settings/profile")({
  validateSearch: z.object({
    linked: z.string().optional().catch(undefined),
    error: z.string().optional().catch(undefined),
  }),
  component: ProfilePage,
});
