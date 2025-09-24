import { SignOutButton } from "~/features/auth";
import { Stack } from "~/shared/ui";
import { AccountSettings, AuthUserInfo } from "~/widgets";

export function SettingsPage() {
  return (
    <Stack.VStack alignItems="stretch" gap="1rem">
      <AuthUserInfo />
      <AccountSettings />
      <SignOutButton />
    </Stack.VStack>
  );
}
