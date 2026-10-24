import { createFileRoute, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { ResetPasswordForm } from "~/features/resetPassword";
import { useSeo } from "~/shared/seo";
import { Box, Flex } from "~/shared/ui";

const recoverAccountSearchSchema = z.object({
  email: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/(auth)/_auth/recover-account/")({
  validateSearch: recoverAccountSearchSchema,
  component: RecoverAccountPage,
});

function RecoverAccountPage() {
  useSeo({ noIndex: true, path: "/recover-account" });

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
    <Box position="relative" w="full" minH="100%">
      <Flex
        direction="column"
        align="center"
        w="full"
        minH="100vh"
        pt={{ base: "1.5rem", md: "2rem" }}
        pb="2rem"
        px="1rem"
        position="relative"
        zIndex={1}
      >
        <Box
          padding="1.5rem"
          borderRadius="xl"
          width="full"
          minW={0}
          maxW={400}
        >
          <ResetPasswordForm
            recoveryEmail={recoveryEmail}
            onRecoveryEmailChange={handleRecoveryEmailChange}
          />
        </Box>
      </Flex>
    </Box>
  );
}
