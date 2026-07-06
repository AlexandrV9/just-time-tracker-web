import { SignOutButton } from "~/features/auth";
import { Flex, Stack } from "~/shared/ui";
import { AccountSettings, AuthUserInfo, HelpInfoSettings } from "~/widgets";

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
      <HelpInfoSettings />
      <Flex justifyContent="center">
        <SignOutButton />
      </Flex>
    </Stack.VStack>
  );
}
