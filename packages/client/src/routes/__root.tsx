import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import type { RouterContext } from "~/app/providers/RouterProvider/types"; // TODO: подумать над другим местом размещения
import { LangSwitcher, ThemeSwitcher } from "~/features";
// import { AuthFloatingLinesBackground } from "~/shared/components";

import { BackButton, Box, Flex, PageLayout } from "~/shared/ui";

const RootLayout = () => {
  return (
    <>
      {/* <AuthFloatingLinesBackground /> */}
      <Outlet />
    </>
  );
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NofFoundPage,
});

function NofFoundPage() {
  return (
    <PageLayout>
      <PageLayout.TopContainer
        as="header"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px solid"
        borderColor="border.emphasized"
        px="1rem"
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
      <PageLayout.MainContainer as="main" p="1rem">
        NotFound
      </PageLayout.MainContainer>
    </PageLayout>
  );
}
