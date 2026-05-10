import { SignInByLoginForm } from "~/features/auth";
import { Box } from "~/shared/ui";

export function SignInPage() {
  return (
    <Box
      padding="1.5rem"
      bg="bg"
      borderRadius="xl"
      width="full"
      minWidth={320}
      maxWidth={400}
    >
      <SignInByLoginForm />
    </Box>
  );
}
