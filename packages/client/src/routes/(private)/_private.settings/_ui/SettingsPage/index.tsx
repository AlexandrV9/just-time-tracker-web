import { SignOutButton } from "~/features/auth";
import { AuthUserInfo, HelpInfoSettings } from "~/widgets";
import { Stack } from "~/shared/ui";
import { AccountSettings } from "./AccountSettings";
import { InterfaceSettings } from "./InterfaceSettings";

export function SettingsPage() {
  return (
    <Stack.VStack
      w="full"
      maxW="520px"
      mx="auto"
      p="1rem"
      gap="1rem"
      alignItems="stretch"
    >
      <Stack.HStack justify="center">
        <AuthUserInfo />
      </Stack.HStack>
      <AccountSettings />
      <InterfaceSettings />
      <HelpInfoSettings />
      <Stack.HStack justifyContent="center">
        <SignOutButton />
      </Stack.HStack>
    </Stack.VStack>
  );
}
