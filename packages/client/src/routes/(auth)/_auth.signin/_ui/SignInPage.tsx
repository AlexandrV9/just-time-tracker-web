import { SignInByLoginForm } from "~/features/auth";
import { useSeo } from "~/shared/seo";
import { Box, Flex, Stack } from "~/shared/ui";

export function SignInPage() {
  useSeo({
    description:
      "Sign in to Just Time Tracker — track time, manage activities, and review your day.",
    path: "/signin",
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
        <Stack.VStack gap="1rem">
          <SignInByLoginForm />
          {/* <Flex align="center" gap="0.75rem">
            <Box flex="1" height="1px" bg="border.emphasized" />
            <Text fontSize="sm" color="fg.muted" flexShrink={0}>
              {t("features.auth.yandexLogin.divider")}
            </Text>
            <Box flex="1" height="1px" bg="border.emphasized" />
          </Flex> */}
          {/* <YandexLoginButton redirect={redirect ?? "/"} /> */}
        </Stack.VStack>
      </Box>
    </Flex>
  );
}
