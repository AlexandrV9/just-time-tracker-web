import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import { authManager } from "../../AuthManager";
import { ApiError } from "~/shared/config/error";
import { useRetryAfterCountdown, useTranslation } from "~/shared/hooks";
import { getRetryAfter } from "~/shared/libs";
import { toast } from "~/shared/ui";
import { requestPwaInstallDialog } from "~/features/pwa-install";

export type UseSignInByLoginProps = {
  successRedirectUrl?: string;
};

const baseLocale = "features.auth.signInByLoginForm";

export const useSignInByLogin = (props?: UseSignInByLoginProps) => {
  const { successRedirectUrl = "/" } = props ?? {};

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    secondsLeft: retrySecondsLeft,
    isBlocked: isRetryBlocked,
    setRetryAfter,
  } = useRetryAfterCountdown();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { login: string; password: string }) =>
      authManager.signInByLogin(data),
    onSuccess: (response) => {
      if (!response.success) {
        handleSignInFailure(t, response.message, response.data, setRetryAfter);
        return;
      }

      requestPwaInstallDialog();
      navigate({ to: successRedirectUrl });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        handleSignInFailure(t, error.message, error.data, setRetryAfter);
        return;
      }

      const message = error instanceof Error ? error.message : undefined;
      showSignInErrorToast(t, message);
    },
  });

  return {
    isPending,
    retrySecondsLeft,
    isRetryBlocked,
    signInFn: mutate,
  };
};

const handleSignInFailure = (
  t: TFunction<"translation", undefined>,
  message: string | undefined,
  data: unknown,
  setRetryAfter: (retryAfter: string) => void,
) => {
  if (message === "RATE_LIMITED") {
    const retryAfter = getRetryAfter(data);
    if (retryAfter) {
      setRetryAfter(retryAfter);
      return;
    }
  }

  showSignInErrorToast(t, message);
};

function getSignInErrorMessage(
  t: TFunction<"translation", undefined>,
  message?: string,
) {
  switch (message) {
    case "Login or password is not correct":
      return t(`${baseLocale}.errors.invalidCredentials`);
    default:
      return t(`${baseLocale}.errors.unknown`);
  }
}

function showSignInErrorToast(
  t: TFunction<"translation", undefined>,
  message?: string,
) {
  toast.error(getSignInErrorMessage(t, message), {
    position: "top-center",
    draggable: true,
    toastId: "error_sign_in",
  });
}
