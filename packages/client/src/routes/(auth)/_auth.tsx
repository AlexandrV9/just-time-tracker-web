import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useCallback, useLayoutEffect } from "react";
import z from "zod";
import { LangSwitcher, ThemeSwitcher } from "~/features";
import { authManager, useAuthStore } from "~/features/auth";
import { useDeviceDetect, useTranslation } from "~/shared/hooks";
import { Box, Flex, PageLayout } from "~/shared/ui";
import {
  AboutUsButton,
  Header,
  HeaderAppTitle,
  useHeaderStore,
} from "~/widgets";

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
  const { setContent } = useHeaderStore();
  const { type: deviceType } = useDeviceDetect();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    setContent("left", <AboutUsButton />);
    setContent(
      "right",
      <Flex justifyContent="end" gap={2}>
        <LangSwitcher />
        <ThemeSwitcher />
      </Flex>,
    );
    setContent("center", <HeaderAppTitle />);
  }, [setContent, t]);

  const renderLayoutComponent = useCallback(() => {
    switch (deviceType) {
      case "desktop":
        return <DesktopLayout />;
      case "tablet":
        return <DesktopLayout />;
      case "mobile":
        return <DesktopLayout />;
      default:
        return <DesktopLayout />;
    }
  }, [deviceType]);

  const layoutComponent = renderLayoutComponent();

  return layoutComponent;
}

function DesktopLayout() {
  return (
    <PageLayout>
      <PageLayout.TopContainer
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderBottom="1px solid"
        borderColor="border.emphasized"
        bg="transparent"
      >
        <Box
          width="full"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Header />
        </Box>
      </PageLayout.TopContainer>
      <PageLayout.MainContainer p="0" contentProps={{ maxW: "none", p: 0 }}>
        <Outlet />
      </PageLayout.MainContainer>
    </PageLayout>
  );
}
