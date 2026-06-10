import { BackButton, Stack } from "~/shared/ui";
import { AuthUserInfo, useHeaderLeftContent } from "~/widgets";
import { EmailInfo } from "./EmailInfo";
import { MainInfo } from "./MainInfo";

export function ProfilePage() {
  useHeaderLeftContent(<BackButton to="/settings" />);

  return (
    <Stack.VStack
      alignItems="stretch"
      p={4}
      w="full"
      maxW="520px"
      mx="auto"
      gap="1rem"
    >
      <AuthUserInfo />
      <MainInfo />
      <EmailInfo />
    </Stack.VStack>
  );
}
