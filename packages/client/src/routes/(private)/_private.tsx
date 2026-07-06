import { Spinner } from "@chakra-ui/react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useCallback, useLayoutEffect } from "react";
import { LangSwitcher, ThemeSwitcher, useActivityEvents } from "~/features";
import { authManager, AuthUserAvatar, useAuthStore } from "~/features/auth";
import {
  NotificationButton,
  usePushNotifications,
} from "~/features/notifications";
import { PwaInstallDialog } from "~/features/pwa-install";
import {
  useDeviceDetect,
  useOrientation,
  useTranslation,
} from "~/shared/hooks";
import { buildLocationRedirectPath } from "~/shared/libs";
import { useSeo } from "~/shared/seo";
import { Box, Flex, PageLayout } from "~/shared/ui";
import { Header, HeaderAppTitle, NavBar, useHeaderStore } from "~/widgets";
import { prefetchNavTabForPath } from "./_private/_lib/prefetchNavTabs";
import { usePreloadNavTabs } from "./_private/_lib/usePreloadNavTabs";

function PrivateRoutePending() {
  const { t } = useTranslation();
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100dvh"
      role="status"
      aria-live="polite"
      aria-label={t("pages.private.pending")}
    >
      <Spinner size="lg" color="fg.muted" />
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
  loader: async ({ context, location }) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    await prefetchNavTabForPath(location.pathname, userId, context.queryClient);
  },
  component: PrivateLayout,
});

function PrivateLayout() {
  const { setContent } = useHeaderStore();

  useSeo({ noIndex: true });
  useActivityEvents();
  usePushNotifications();
  usePreloadNavTabs();
  useLayoutEffect(() => {
    setContent("left", <AuthUserAvatar />);
    setContent("center", <HeaderAppTitle />);
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

  const renderLayoutComponent = useCallback(() => {
    switch (deviceType) {
      case "desktop":
        return <DesktopLayout />;
      case "tablet":
        return <TabletLayout />;
      case "mobile":
        return <MobileLayout />;
      default:
        return <MobileLayout />;
    }
  }, [deviceType]);

  const layoutComponent = renderLayoutComponent();

  return (
    <>
      {layoutComponent}
      <PwaInstallDialog />
    </>
  );
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
  // console.log(orientation);

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
    default: {
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
  }
}
