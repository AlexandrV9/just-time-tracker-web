import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { LandingPage } from "./_ui/LandingPage";

const landingSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/(public)/_public/landing/")({
  validateSearch: zodValidator(landingSearchSchema),
  component: LandingPage,
});
