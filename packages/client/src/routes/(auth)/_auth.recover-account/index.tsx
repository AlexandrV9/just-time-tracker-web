import { createFileRoute } from "@tanstack/react-router";
import { RecoverAccountForm } from "~/features/passwordReset";
import { Flex } from "~/shared/ui";

export const Route = createFileRoute("/(auth)/_auth/recover-account/")({
  component: RecoverAccountPage,
});

function RecoverAccountPage() {
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
      <RecoverAccountForm />
    </Flex>
  );
}
