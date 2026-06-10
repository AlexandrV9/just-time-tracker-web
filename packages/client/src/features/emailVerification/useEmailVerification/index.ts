import { useMutation, useQuery } from "@tanstack/react-query";
import type { EmailVerificationStateDTO } from "@to-do-list/shared";
import { useCallback, useEffect, useState } from "react";
import { authActions } from "~/features/auth";
import { userApiService } from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { toast } from "~/shared/ui";

const baseLocale = "features.emailVerification";

export type EmailVerificationStep = "email" | "code";

const mapRequestErrorKey = (message?: string) => {
  switch (message) {
    case "EMAIL_ALREADY_EXISTS":
      return "errors.emailAlreadyExists";
    case "RESEND_TOO_EARLY":
      return "errors.resendTooEarly";
    case "CODE_NOT_FOUND":
      return "errors.codeNotFound";
    default:
      return "errors.requestFailed";
  }
};

const mapConfirmErrorKey = (message?: string) => {
  switch (message) {
    case "INVALID_CODE":
      return "errors.invalidCode";
    case "TOO_MANY_ATTEMPTS":
      return "errors.tooManyAttempts";
    case "CODE_NOT_FOUND":
      return "errors.codeNotFound";
    case "EMAIL_ALREADY_EXISTS":
      return "errors.emailAlreadyExists";
    default:
      return "errors.verifyFailed";
  }
};

const logDevCode = (devCode?: string) => {
  if (devCode) {
    console.info("[dev] email verification code:", devCode);
  }
};

type UseEmailVerificationOptions = {
  enabled: boolean;
  onVerified?: () => void;
};

export function useEmailVerification({
  enabled,
  onVerified,
}: UseEmailVerificationOptions) {
  const { t } = useTranslation();

  const [serverState, setServerState] =
    useState<EmailVerificationStateDTO | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [codeResetKey, setCodeResetKey] = useState(0);

  const resetCodeInput = useCallback(() => {
    setCodeResetKey((key) => key + 1);
  }, []);

  const statusQuery = useQuery({
    queryKey: ["email-verification-status"],
    queryFn: () => userApiService.getEmailVerificationStatus(),
    enabled,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

  useEffect(() => {
    if (statusQuery.data?.success) {
      setServerState(statusQuery.data.data);
    }
  }, [statusQuery.data]);

  useEffect(() => {
    if (!enabled) {
      setServerState(null);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Re-sync immediately so a reopened dialog doesn't show a stale frozen
    // countdown for one tick before the interval catches up.
    setNowTs(Date.now());

    const timerId = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timerId);
  }, [enabled]);

  useEffect(() => {
    if (serverState?.resendAvailableAt) {
      setNowTs(Date.now());
    }
  }, [serverState?.resendAvailableAt]);

  const status = serverState?.status ?? "none";
  const pendingEmail = serverState?.email ?? "";
  const expiresAt = serverState?.expiresAt;
  const resendAvailableAt = serverState?.resendAvailableAt;

  const isExpired =
    status === "expired" ||
    (status === "pending" && !!expiresAt && Date.parse(expiresAt) <= nowTs);

  const resendSecondsLeft = resendAvailableAt
    ? Math.max(0, Math.floor((Date.parse(resendAvailableAt) - nowTs) / 1000))
    : 0;

  const isStatusLoading = enabled && statusQuery.isLoading && serverState === null;

  const step: EmailVerificationStep | null = isStatusLoading
    ? null
    : status === "none"
      ? "email"
      : "code";

  const startMutation = useMutation({
    mutationFn: userApiService.startEmailVerification,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.${mapRequestErrorKey(response.message)}`));
        return;
      }
      setServerState(response.data);
      resetCodeInput();
      logDevCode(response.data.devCode);
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.requestFailed`));
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => userApiService.resendEmailVerification(),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.${mapRequestErrorKey(response.message)}`));
        return;
      }
      setServerState(response.data);
      resetCodeInput();
      logDevCode(response.data.devCode);
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.requestFailed`));
    },
  });

  const confirmMutation = useMutation({
    mutationFn: userApiService.confirmEmailVerification,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.${mapConfirmErrorKey(response.message)}`));
        if (response.message === "INVALID_CODE") {
          resetCodeInput();
        }
        if (response.message === "TOO_MANY_ATTEMPTS") {
          resetCodeInput();
          setServerState((prev) => {
            if (!prev || prev.status === "none") return prev;
            const resendAvailableAt =
              (response.data as { resendAvailableAt?: string } | undefined)
                ?.resendAvailableAt ?? new Date().toISOString();
            return { ...prev, resendAvailableAt };
          });
        }
        return;
      }

      if (response.data.status === "expired") {
        setServerState({ status: "expired", email: pendingEmail });
        resetCodeInput();
        toast.error(t(`${baseLocale}.errors.codeExpired`));
        return;
      }

      const { user } = response.data;
      authActions.setUser({ ...user, id: String(user.id) });
      toast.success(t(`${baseLocale}.verified`));
      onVerified?.();
    },
    onError: () => {
      resetCodeInput();
      toast.error(t(`${baseLocale}.errors.verifyFailed`));
    },
  });

  const start = useCallback(
    (email: string) => startMutation.mutate({ email }),
    [startMutation],
  );

  const confirm = useCallback(
    (code: string) => confirmMutation.mutate({ code }),
    [confirmMutation],
  );

  const resend = useCallback(() => {
    if (resendSecondsLeft > 0) return;
    resendMutation.mutate();
  }, [resendMutation, resendSecondsLeft]);

  const cancelMutation = useMutation({
    mutationFn: () => userApiService.cancelEmailVerification(),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.errors.requestFailed`));
        return;
      }
      setServerState(response.data);
      resetCodeInput();
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.requestFailed`));
    },
  });

  const cancel = useCallback(
    (afterCancel?: () => void) => {
      cancelMutation.mutate(undefined, {
        onSuccess: (response) => {
          if (response.success) afterCancel?.();
        },
      });
    },
    [cancelMutation],
  );

  return {
    status,
    step,
    isExpired,
    pendingEmail,
    resendSecondsLeft,
    canResend: resendSecondsLeft <= 0,
    isStatusLoading,
    isStartPending: startMutation.isPending,
    isConfirmPending: confirmMutation.isPending,
    isResendPending: resendMutation.isPending,
    isCancelPending: cancelMutation.isPending,
    codeResetKey,
    start,
    confirm,
    resend,
    cancel,
  };
}
