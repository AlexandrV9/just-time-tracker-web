import { useSearch } from "@tanstack/react-router";
import { SignInByLoginForm, YandexLoginButton } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import { Box, Flex, Stack, Text } from "~/shared/ui";


export function SignInPage() {
  const { t } = useTranslation();
  const { redirect } = useSearch({ from: "/(auth)/_auth/signin/" });

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
          <Flex align="center" gap="0.75rem">
            <Box flex="1" height="1px" bg="border.emphasized" />
            <Text fontSize="sm" color="fg.muted" flexShrink={0}>
              {t("features.auth.yandexLogin.divider")}
            </Text>
            <Box flex="1" height="1px" bg="border.emphasized" />
          </Flex>
          <YandexLoginButton redirect={redirect ?? "/"} />
        </Stack.VStack>
      </Box>
    </Flex>
  );
}
