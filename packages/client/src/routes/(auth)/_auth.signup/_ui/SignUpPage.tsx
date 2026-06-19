import { SignUpForm } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import { useSeo } from "~/shared/seo";
import { Box, Flex, Link, Text } from "~/shared/ui";

const baseLocale = "pages.signUp.legalNotice";

export function SignUpPage() {
  const { t } = useTranslation();

  useSeo({
    description:
      "Create a Just Time Tracker account and start tracking your daily activities.",
    path: "/signup",
  });

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      gap="1rem"
      w="full"
      minW={0}
      maxW="full"
      py="1rem"
      px="1rem"
      overflowX="hidden"
    >
      <Box
        padding="1.5rem"
        bg="bg"
        borderRadius="xl"
        width="full"
        minW={0}
        maxW={400}
      >
        <SignUpForm />
      </Box>
      <Text
        color="fg.subtle"
        textStyle="sm"
        textAlign="center"
        maxW="400px"
        lineHeight="1.5"
      >
        {t(`${baseLocale}.prefix`)}{" "}
        <Text
          as="span"
          color="fg"
          textDecoration="underline"
          textUnderlineOffset="3px"
          _hover={{ opacity: 0.8 }}
        >
          <Link to="/terms-of-service">{t(`${baseLocale}.termsLink`)}</Link>
        </Text>{" "}
        {t(`${baseLocale}.middle`)}{" "}
        <Text
          as="span"
          color="fg"
          textDecoration="underline"
          textUnderlineOffset="3px"
          _hover={{ opacity: 0.8 }}
        >
          <Link to="/privacy-policy">{t(`${baseLocale}.privacyLink`)}</Link>
        </Text>
      </Text>
    </Flex>
  );
}
