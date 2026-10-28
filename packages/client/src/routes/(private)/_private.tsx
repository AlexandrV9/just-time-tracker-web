import { Spinner } from "@chakra-ui/react";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { useActivityEvents } from "~/features";
import { authManager, useAuthStore } from "~/features/auth";
import {
  NotificationButton,
  usePushNotifications,
} from "~/features/notifications";
import { PwaInstallDialog } from "~/features/pwa-install";
import { useDeviceDetect, useTranslation } from "~/shared/hooks";
import { buildLocationRedirectPath } from "~/shared/libs";
import { useSeo } from "~/shared/seo";
import {
  Box,
  Flex,
  PageLayout,
  DesignTheme,
  Link,
  NavigationItem,
} from "~/shared/ui";
import { Header, HeaderAppTitle, SideBar, useHeaderStore } from "~/widgets";
import { prefetchNavTabForPath } from "./_private/_lib/prefetchNavTabs";
import { usePreloadNavTabs } from "./_private/_lib/usePreloadNavTabs";
import { AuthUser } from "~/features/auth/ui";
import { navItems } from "~/widgets/NavBar/constants";
import styles from "./Private.module.css";

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
  const setContent = useHeaderStore((state) => state.setContent);

  const { type: deviceType } = useDeviceDetect();

  useSeo({ noIndex: true });
  useActivityEvents();
  usePushNotifications();
  usePreloadNavTabs();
  useLayoutEffect(() => {
    setContent("left", <AuthUser.Avatar />);

    setContent("center", deviceType === "mobile" ? <HeaderAppTitle /> : null);

    setContent(
      "right",
      <Flex justifyContent="end" gap={2}>
        <NotificationButton />
      </Flex>,
    );
  }, [deviceType, setContent]);

  return (
    <DesignTheme appearance="inherit" className={styles.page}>
      <div className={styles.workspace}>
        <div className={styles.sidebar}>
          <SideBar />
        </div>
        <div className={styles.main}>
          <div className={styles.header}>
            <Header />
          </div>
          <PageLayout.MainContainer
            contentProps={{ maxW: "none" }}
            className={styles.viewport}
          >
            <Outlet />
          </PageLayout.MainContainer>
        </div>
        <MobileNavigation />
      </div>
      <PwaInstallDialog />
    </DesignTheme>
  );
}

function MobileNavigation() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  return (
    <nav
      className={styles.mobileNav}
      aria-label={t("pages.dashboard.navigation")}
    >
      {navItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <NavigationItem key={item.id} asChild active={active}>
            <Link
              to={item.href}
              aria-label={t(`widgets.navbar.menuItems.${item.title}`)}
              aria-current={active ? "page" : undefined}
            >
              <item.icon size={21} aria-hidden="true" />
              <span>{t(`widgets.navbar.menuItems.${item.title}`)}</span>
            </Link>
          </NavigationItem>
        );
      })}
    </nav>
  );
}
