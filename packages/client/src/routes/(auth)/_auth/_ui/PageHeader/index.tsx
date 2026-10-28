import { PreferencesButton } from "~/features";
import { useTranslation } from "~/shared/hooks";
import {
  ArrowRightIcon,
  Box,
  Brand,
  Button,
  Flex,
  Link,
  PageLayout,
} from "~/shared/ui";

export const PageHeader = () => {
  const { t } = useTranslation();

  return (
    <PageLayout.TopContainer
      as="header"
      bg="appPage.bg"
      borderBottom="1px solid"
      borderColor="appPage.headerBorder"
    >
      <Box
        asChild
        display="inline-flex"
        alignItems="center"
        flexShrink={0}
        textDecoration="none"
        color="appPage.fg"
      >
        <Link to="/landing">
          <Brand />
        </Link>
      </Box>
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
          <Link to="/landing" aria-label={t("pages.auth.backToLanding")}>
            <Flex as="span" align="center" gap="10px">
              {t("pages.auth.backToLanding")}
              <ArrowRightIcon size={15} aria-hidden="true" />
            </Flex>
          </Link>
        </Button>
      </Flex>
    </PageLayout.TopContainer>
  );
};
