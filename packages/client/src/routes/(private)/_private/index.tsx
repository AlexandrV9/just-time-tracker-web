import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "./_ui/HomePage";
import z from "zod";

const privateSearchSchema = z.object({
  activityId: z.string().optional(),
});

export type PrivateSearch = z.infer<typeof privateSearchSchema>;

export const Route = createFileRoute("/(private)/_private/")({
  validateSearch: privateSearchSchema,
  component: HomePage,
});
