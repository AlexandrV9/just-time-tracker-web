import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useLayoutEffect, useMemo } from "react";
import { LangSwitcher, ThemeSwitcher } from "~/features";
import { useTranslation } from "~/shared/hooks";
import { Button, Flex, Link, PageLayout } from "~/shared/ui";
import { Header, useHeaderStore } from "~/widgets";

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
              {t("pages.landing.signIn")}
            </Link>
          </Button>
        ) : null,
      );
    }
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
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderBottom="1px solid"
        borderColor="border.emphasized"
      >
        <Header />
      </PageLayout.TopContainer>
      <PageLayout.MainContainer as="main">
        <Outlet />
      </PageLayout.MainContainer>
    </PageLayout>
  );
}
