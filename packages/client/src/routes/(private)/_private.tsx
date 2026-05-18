import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { LangSwitcher, ThemeSwitcher } from "~/features";
import { authManager, AuthUserAvatar, useAuthStore } from "~/features/auth";
import { NotificationButton } from "~/features/notifications";
import { useDeviceDetect, useOrientation, useTranslation } from "~/shared/hooks";
import { buildLocationRedirectPath } from "~/shared/libs";
import { Box, Flex, PageLayout, Text } from "~/shared/ui";
import { Header, NavBar, useHeaderStore } from "~/widgets";

function PrivateRoutePending() {
  const { t } = useTranslation();
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={8}>
      <Text color="fg.muted">{t("pages.private.pending")}</Text>
    </Box>
  );
}

export const Route = createFileRoute("/(private)/_private")({
  beforeLoad: async ({ location }) => {
    const authStatus = useAuthStore.getState().status;
    const authRedirect = buildLocationRedirectPath(location);

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
          to: "/landing",
          search: {
            redirect: authRedirect,
          },
        });
      }
    }

    if (authStatus === "UNAUTHENTICATED") {
      throw redirect({
        to: "/landing",
        search: {
          redirect: authRedirect,
        },
      });
    }

    if (authStatus === "PENDING") {
      console.log("Auth check in progress...");
    }
  },
  pendingComponent: PrivateRoutePending,
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
      </Flex>,
    );
  }, [setContent]);

  const { type: deviceType } = useDeviceDetect();

  switch (deviceType) {
    case "desktop":
      return <DesktopLayout />;
    case "tablet":
      return <TabletLayout />;
    case "mobile":
      return <MobileLayout />;
    default:
      return null;
  }
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

function TabletLayout() {
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

function MobileLayout() {
  const { orientation } = useOrientation();

  console.log(orientation);

  switch (orientation) {
    case "landscape-primary":
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
    case "landscape-secondary":
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
    case "portrait-secondary":
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
    case "portrait-primary": {
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
    default:
      return null;
  }
}
