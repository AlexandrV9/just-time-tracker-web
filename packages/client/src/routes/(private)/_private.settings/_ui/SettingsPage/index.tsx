import { SignOutButton } from "~/features/auth";
import { Stack } from "~/shared/ui";
import { AuthUserInfo } from "~/widgets";
import { InterfaceSettings } from "./InterfaceSettings";
import { AccountSettings } from "./AccountSettings";
import { HelpInfoSettings } from "./HelpInfoSettings";

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
      <Stack.HStack justify="center">
        <SignOutButton />
      </Stack.HStack>
    </Stack.VStack>
  );
}
