import { Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { authManager } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import { useSeo } from "~/shared/seo";
import { toast } from "~/shared/ui";
import { Flex } from "~/shared/ui";
import { requestPwaInstallDialog } from "~/features";

const searchSchema = z.object({
  redirect: z.string().optional().catch(""),
  error: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/(auth)/_auth/callback/")({
  validateSearch: searchSchema,
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const { t } = useTranslation();
  const { redirect: redirectTo, error } = Route.useSearch();
  const navigate = useNavigate();

  useSeo({ noIndex: true, path: "/callback" });

  useEffect(() => {
    if (error) {
      const message = t(`features.auth.yandexLogin.errors.${error}`, {
        defaultValue: t("features.auth.yandexLogin.errors.login_error"),
      });
      toast.error(message, { position: "top-center", toastId: "oauth_error" });
      navigate({ to: "/signin" });
      return;
    }

    authManager.checkAuth().then((ok) => {
      if (ok) {
        requestPwaInstallDialog();
        navigate({ to: redirectTo ?? "/" });
      } else {
        navigate({ to: "/signin" });
      }
    });
  }, [error, navigate, redirectTo, t]);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      w="full"
      h="100dvh"
      role="status"
      aria-live="polite"
      aria-label={t("pages.private.pending")}
    >
      <Spinner size="lg" color="fg.muted" />
    </Flex>
  );
}
