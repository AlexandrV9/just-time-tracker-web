import { useOnline } from "~/shared/hooks";
import { Box } from "~/shared/ui";
import { SignInByLoginForm } from "~/widgets";

export function SignInPage() {
  const { isOnline } = useOnline();
  return (
    <Box
      padding="1.5rem"
      bg="bg"
      borderRadius="xl"
      width="full"
      minWidth={320}
      maxWidth={380}
      shadow="0 2px 8px rgba(0, 0, 0, 0.2)"
      border="1px solid"
      borderColor="border.emphasized"
    >
      {isOnline ? "online" : "offline"}
      <SignInByLoginForm />
    </Box>
  );
}
