import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { LangSwitcher, ThemeSwitcher } from "~/features";
import { authManager, AuthUserAvatar, useAuthStore } from "~/features/auth";
import { NotificationButton } from "~/features/notifications";
import { useOrientation } from "~/shared/hooks";
import { Box, Flex, PageLayout } from "~/shared/ui";
import { Header, NavBar, useHeaderStore } from "~/widgets";

export const Route = createFileRoute("/(private)/_private")({
  beforeLoad: async ({ location }) => {
    const authStatus = useAuthStore.getState().status;

    if (authStatus === "AUTHENTICATED") {
      return;
    }

    if (authStatus === "IDLE") {
      try {
        const isAuthenticated = await authManager.checkAuth();

        if (!isAuthenticated) {
          throw new Error();
        }

        return;
      } catch {
        throw redirect({
          to: "/signin",
          search: { redirect: location.href },
        });
      }
    }

    if (authStatus === "UNAUTHENTICATED") {
      throw redirect({
        to: "/signin",
        search: { redirect: location.href },
      });
    }

    if (authStatus === "PENDING") {
      console.log("Auth check in progress...");
    }
  },
  loader: () => <div>ddd</div>,
  component: PrivateLayout,
});

export function PrivateLayout() {
  const { setContent } = useHeaderStore();

  useLayoutEffect(() => {
    setContent("left", <AuthUserAvatar />);
    setContent(
      "right",
      <Flex justifyContent="end" gap={2}>
        <LangSwitcher />
        <ThemeSwitcher />
        <NotificationButton />
      </Flex>
    );
  }, [setContent]);

  const { orientation } = useOrientation();

  if (orientation === "landscape-secondary") {
    return (
      <PageLayout
        display="flex"
        paddingRight="var(--safe-area-inset-right, 0px)"
      >
        <Box
          display="flex"
          justifyContent="center"
          borderRight="1px solid"
          borderColor="border.emphasized"
        >
          <NavBar
            isVertical
            display="flex"
            justifyContent="center"
            alignItems="center"
            paddingLeft="10px"
          />
        </Box>
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          overflow="hidden"
          borderRight="1px solid"
          borderColor="border.emphasized"
        >
          <PageLayout.TopContainer
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderBottom="1px solid"
            borderColor="border.emphasized"
          >
            <Header />
          </PageLayout.TopContainer>
          <PageLayout.MainContainer>
            <Outlet />
          </PageLayout.MainContainer>
        </Box>
      </PageLayout>
    );
  }

  if (orientation === "landscape-primary") {
    return (
      <PageLayout
        display="flex"
        paddingLeft="var(--safe-area-inset-right, 0px)"
      >
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          overflow="hidden"
          borderLeft="1px solid"
          borderColor="border.emphasized"
        >
          <PageLayout.TopContainer
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderBottom="1px solid"
            borderColor="border.emphasized"
          >
            <Header />
          </PageLayout.TopContainer>
          <PageLayout.MainContainer>
            <Outlet />
          </PageLayout.MainContainer>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          borderLeft="1px solid"
          borderColor="border.emphasized"
        >
          <NavBar
            isVertical
            display="flex"
            justifyContent="center"
            alignItems="center"
          />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageLayout.TopContainer
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderBottom="1px solid"
        borderColor="border.emphasized"
      >
        <Header />
      </PageLayout.TopContainer>
      <PageLayout.MainContainer>
        <Outlet />
      </PageLayout.MainContainer>
      <PageLayout.BottomContainer>
        <NavBar />
      </PageLayout.BottomContainer>
    </PageLayout>
  );
}
