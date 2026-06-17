import { createFileRoute } from "@tanstack/react-router";
import { Flex } from "~/shared/ui";
import { SignUpEmailStep } from "~/features/emailVerification";

export const Route = createFileRoute("/(private)/_private/signup-email/")({
  component: SignUpEmailPage,
});

function SignUpEmailPage() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      w="full"
      minW={0}
      py="1rem"
      px="1rem"
    >
      <SignUpEmailStep />
    </Flex>
  );
}
