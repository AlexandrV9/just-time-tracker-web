import {
  ArrowRightIcon,
  Box,
  Brand,
  Button,
  Flex,
  Link,
  PageLayout,
  type BoxProps,
} from "~/shared/ui";
import { PreferencesButton } from "~/features";
import { useTranslation } from "~/shared/hooks";
import { useSearch } from "@tanstack/react-router";

const navLinkProps = {
  color: "landingMuted.text",
  fontSize: { md: "10px", lg: "12px" },
  transition: "color 180ms",
  _hover: { color: "landingPage.fg" },
} satisfies BoxProps;

export const Header = () => {
  const { redirect } = useSearch({ from: "/(public)/_public/landing/" });

  const authSearch = { redirect: redirect?.trim() || "/" };

  const { t } = useTranslation();
  const startLabel = t("pages.landing.signUpButton");

  return (
    <PageLayout.TopContainer
      as="header"
      position="relative"
      zIndex={2}
      bg="landingPage.bg"
      borderBottom="1px solid"
      borderColor="landingPage.border"
    >
      <Box
        asChild
        display="inline-flex"
        alignItems="center"
        gap={{ base: "7px", md: "10px" }}
        flexShrink={0}
        fontSize={{ base: "12px", md: "13px", lg: "15px" }}
        fontWeight="600"
        letterSpacing="-0.035em"
        color="landingPage.fg"
        textDecoration="none"
        _hover={{ color: "landingPage.fg" }}
      >
        <a href="#landing-top" aria-label="Just Time Tracker">
          <Brand />
        </a>
      </Box>

      <Flex
        as="nav"
        display={{ base: "none", md: "flex" }}
        gap={{ md: "18px", lg: "27px" }}
        aria-label={t("pages.landing.design.navigation")}
      >
        <Box asChild {...navLinkProps}>
          <a href="#features">{t("pages.landing.design.featuresNav")}</a>
        </Box>
        <Box asChild {...navLinkProps}>
          <a href="#how-it-works">{t("pages.landing.design.stepsNav")}</a>
        </Box>
        <Box asChild {...navLinkProps}>
          <a href="#preview">{t("pages.landing.design.previewNav")}</a>
        </Box>
      </Flex>

      <Flex align="center" gap={{ base: "8px", md: "10px", lg: "20px" }}>
        <PreferencesButton />
        <Button
          asChild
          variant="accent"
          borderRadius="full"
          size="xs"
          color="landingPage.bright"
          _hover={{ color: "landingPage.bright" }}
        >
          <Link to="/signup" search={authSearch} aria-label={startLabel}>
            <Flex
              as="span"
              display={{ base: "none", md: "inline-flex" }}
              align="center"
              gap="10px"
            >
              {startLabel}
              <ArrowRightIcon size={15} aria-hidden="true" />
            </Flex>
            <Box as="span" display={{ base: "inline", md: "none" }}>
              {t("pages.landing.signInButton")}
            </Box>
          </Link>
        </Button>
      </Flex>
    </PageLayout.TopContainer>
  );
};
