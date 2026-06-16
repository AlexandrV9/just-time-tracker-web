import { createFileRoute, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { ResetPasswordForm } from "~/features/resetPassword";
import { Flex } from "~/shared/ui";
import { useHeaderLeftContent } from "~/widgets";

const recoverAccountSearchSchema = z.object({
  email: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/(auth)/_auth/recover-account/")({
  validateSearch: recoverAccountSearchSchema,
  component: RecoverAccountPage,
});

function RecoverAccountPage() {
  useHeaderLeftContent(null);

  const { email: recoveryEmail } = Route.useSearch();
  const navigate = useNavigate();

  const handleRecoveryEmailChange = (email: string | undefined) => {
    navigate({
      to: "/recover-account",
      search: email ? { email } : {},
      replace: true,
    });
  };

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
      <ResetPasswordForm
        recoveryEmail={recoveryEmail}
        onRecoveryEmailChange={handleRecoveryEmailChange}
      />
    </Flex>
  );
}
