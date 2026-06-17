import { SignOutButton } from "~/features/auth";
import { Flex, Stack } from "~/shared/ui";
import { AccountSettings, AuthUserInfo } from "~/widgets";

export function SettingsPage() {
  return (
    <Stack.VStack
      w="full"
      maxW="520px"
      mx="auto"
      p="1rem"
      gap="2rem"
      alignItems="stretch"
    >
      <AuthUserInfo />
      <AccountSettings />
      <Flex justifyContent="center">
        <SignOutButton />
      </Flex>
    </Stack.VStack>
  );
}
