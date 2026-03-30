import { SignOutButton } from "~/features/auth";
import { Stack } from "~/shared/ui";
import { AccountSettings, AuthUserInfo } from "~/widgets";

export function SettingsPage() {
  return (
    <Stack.VStack alignItems="stretch" gap="1rem" p={4}>
      <AuthUserInfo />
      <AccountSettings />
      <SignOutButton />
    </Stack.VStack>
  );
}
