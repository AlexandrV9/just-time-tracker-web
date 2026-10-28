import { createFileRoute, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { ResetPasswordForm } from "~/features/resetPassword";
import { useSeo } from "~/shared/seo";

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
    <ResetPasswordForm
      recoveryEmail={recoveryEmail}
      onRecoveryEmailChange={handleRecoveryEmailChange}
    />
  );
}
