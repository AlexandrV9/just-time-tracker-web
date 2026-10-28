import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { LangSwitcher, ThemeSwitcher } from "~/features";
import { Flex, PageLayout } from "~/shared/ui";
import { Header, HeaderAppTitle, useHeaderStore } from "~/widgets";

export const Route = createFileRoute("/(public)/_public")({
  component: PublicLayout,
});

export function PublicLayout() {
  const setContent = useHeaderStore((state) => state.setContent);

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isLanding = pathname === "/landing";
  const isLegalPage =
    pathname === "/terms-of-service" || pathname === "/privacy-policy";

  useLayoutEffect(() => {
    if (isLanding) return;

    if (!isLegalPage) {
      setContent("left", null);
    }
    setContent("center", <HeaderAppTitle />);
    setContent(
      "right",
      <Flex justifyContent="end" gap={2}>
        <LangSwitcher />
        <ThemeSwitcher />
      </Flex>,
    );
  }, [isLanding, isLegalPage, setContent]);

  if (isLanding) {
    return <Outlet />;
  }

  return (
    <PageLayout>
      {!isLanding && (
        <PageLayout.TopContainer
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="border.emphasized"
        >
          <Header />
        </PageLayout.TopContainer>
      )}
      <PageLayout.MainContainer
        as="main"
        p={isLanding ? "0" : undefined}
        bg={isLanding ? "var(--design-black)" : undefined}
        css={
          isLanding
            ? {
                "@media (prefers-reduced-motion: no-preference)": {
                  scrollBehavior: "smooth",
                },
              }
            : undefined
        }
        contentProps={isLanding ? { maxW: "none", p: 0 } : undefined}
      >
        <Outlet />
      </PageLayout.MainContainer>
    </PageLayout>
  );
}
