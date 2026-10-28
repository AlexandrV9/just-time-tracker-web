import { Box, Brand, Flex, Link, Text } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <Flex
      as="footer"
      w={{
        base: "calc(100% - 36px)",
        md: "calc(100% - 40px)",
        lg: "100%",
      }}
      maxW="1120px"
      mx="auto"
      mt={{ base: "35px", md: "50px" }}
      py={{ base: "27px", md: "40px" }}
      flexDir={{ base: "column", md: "row" }}
      align={{ base: "flex-start", md: "center" }}
      justify="space-between"
      flexWrap="wrap"
      gap={{ base: "18px", md: "25px" }}
      borderTop="1px solid"
      borderColor="landingPage.border"
    >
      <Box
        asChild
        display="inline-flex"
        alignItems="center"
        gap={{ base: "7px", md: "10px" }}
        fontSize={{ base: "12px", md: "13px", lg: "15px" }}
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
        flexWrap="wrap"
        gap={{ base: "17px", md: "18px" }}
        aria-label={t("pages.landing.design.legal")}
      >
        <Text
          asChild
          color="landingMuted.text"
          fontSize="10px"
          _hover={{ color: "landingPage.fg" }}
        >
          <Link to="/privacy-policy">{t("pages.landing.design.privacy")}</Link>
        </Text>
        <Text
          asChild
          color="landingMuted.text"
          fontSize="10px"
          _hover={{ color: "landingPage.fg" }}
        >
          <Link to="/terms-of-service">
            {t("pages.landing.design.terms")}
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};
