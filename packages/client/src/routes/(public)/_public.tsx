import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useLayoutEffect, useMemo } from "react";
import { LangSwitcher, ThemeSwitcher } from "~/features";
import { useTranslation } from "~/shared/hooks";
import authChromeStyles from "~/shared/styles/authPageChrome.module.css";
import { Button, Flex, Link, PageLayout } from "~/shared/ui";
import { Header, HeaderAppTitle, useHeaderStore } from "~/widgets";

export const Route = createFileRoute("/(public)/_public")({
  component: PublicLayout,
});

export function PublicLayout() {
  const { t } = useTranslation();
  const { setContent } = useHeaderStore();

  const { pathname, landingRedirect } = useRouterState({
    select: (s) => {
      const path = s.location.pathname;
      const redirect =
        path === "/landing"
          ? (() => {
              const sv = s.location.search;
              return typeof sv?.redirect === "string"
                ? sv.redirect.trim()
                : undefined;
            })()
          : undefined;
      return { pathname: path, landingRedirect: redirect };
    },
  });

  const isLanding = pathname === "/landing";
  const isLegalPage =
    pathname === "/terms-of-service" || pathname === "/privacy-policy";

  const headerSignInSearch = useMemo(
    () =>
      isLanding
        ? {
            redirect:
              landingRedirect && landingRedirect.length > 0
                ? landingRedirect
                : "/",
          }
        : undefined,
    [isLanding, landingRedirect],
  );

  useLayoutEffect(() => {
    if (!isLegalPage) {
      setContent(
        "left",
        headerSignInSearch ? (
          <Button asChild size="sm" variant="outline" borderRadius="xl">
            <Link to="/signin" search={headerSignInSearch}>
              {t("pages.landing.signInButton")}
            </Link>
          </Button>
        ) : null,
      );
    }
    setContent("center", <HeaderAppTitle />);
    setContent(
      "right",
      <Flex justifyContent="end" gap={2}>
        <LangSwitcher />
        <ThemeSwitcher />
      </Flex>,
    );
  }, [headerSignInSearch, isLegalPage, setContent, t]);

  return (
    <PageLayout>
      <PageLayout.TopContainer
        className={
          isLanding
            ? `${authChromeStyles.authHeader} ${authChromeStyles.authHeaderSticky}`
            : undefined
        }
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderBottom="1px solid"
        borderColor="border.emphasized"
        bg={isLanding ? "transparent" : undefined}
      >
        <Header />
      </PageLayout.TopContainer>
      <PageLayout.MainContainer
        as="main"
        p={isLanding ? "0" : undefined}
        contentProps={isLanding ? { maxW: "none", p: 0 } : undefined}
      >
        <Outlet />
      </PageLayout.MainContainer>
    </PageLayout>
  );
}
