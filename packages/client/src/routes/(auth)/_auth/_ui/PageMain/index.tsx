import { Outlet } from "@tanstack/react-router";
import { Box, PageLayout } from "~/shared/ui";
import { AuthMobileOrbits } from "./MobileOrbits";
import { AuthStory } from "./AuthStory";
import { authContentProps } from "./constants";

export const PageMain = () => {
  return (
    <PageLayout.MainContainer
      bg="appPage.bg"
      p="0"
      contentProps={authContentProps}
    >
      <AuthStory />
      <Box
        minW="0"
        position="relative"
        py={{ base: "0", lg: "12px" }}
        w={{ base: "min(440px, 100%)", lg: "auto" }}
        isolation="isolate"
        mb={{ base: "180px", lg: "0" }}
        alignSelf="start"
      >
        <AuthMobileOrbits />
        <Box position="relative" zIndex={1}>
          <Outlet />
        </Box>
      </Box>
    </PageLayout.MainContainer>
  );
};
