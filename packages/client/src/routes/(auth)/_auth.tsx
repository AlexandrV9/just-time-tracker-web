import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { authManager, useAuthStore } from "~/features/auth";
import { PageLayout } from "~/shared/ui";
import { PageHeader } from "./_auth/_ui/PageHeader";
import { PageMain } from "./_auth/_ui/PageMain";

export const Route = createFileRoute("/(auth)/_auth")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: async ({ search }) => {
    const authStatus = useAuthStore.getState().status;

    if (authStatus === "AUTHENTICATED") {
      throw redirect({ to: search.redirect || "/" });
    }

    if (authStatus === "IDLE") {
      try {
        const isAuthenticated = await authManager.checkAuth();

        if (isAuthenticated) {
          throw new Error();
        }
      } catch {
        throw redirect({ to: search.redirect || "/" });
      }

      return;
    }
  },
  component: AuthLayout,
});

export function AuthLayout() {
  return (
    <PageLayout bg="appPage.bg" color="appPage.fg">
      <PageHeader />
      <PageMain />
    </PageLayout>
  );
}
