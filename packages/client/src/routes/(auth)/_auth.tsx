import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import z from "zod";
import { LangSwitcher, ThemeSwitcher } from "~/features";
import { authManager, useAuthStore } from "~/features/auth";
import { BackButton, Box, Flex, PageLayout } from "~/shared/ui";

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
    <PageLayout px="1rem">
      <PageLayout.TopContainer
        as="header"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box
          width="full"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <BackButton />
          <Flex justifyContent="end" gap={2}>
            <LangSwitcher />
            <ThemeSwitcher />
          </Flex>
        </Box>
      </PageLayout.TopContainer>
      <PageLayout.MainContainer as="main" p="0">
        <Box mt="3rem" width="full" display="flex" justifyContent="center">
          <Outlet />
        </Box>
      </PageLayout.MainContainer>
    </PageLayout>
  );
}
