import { BackButton, Stack } from "~/shared/ui";
import { useHeaderLeftContent } from "~/widgets";
import { LoginMethods } from "./LoginMethods";

export function SecurityPage() {
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
      <LoginMethods />
    </Stack.VStack>
  );
}
