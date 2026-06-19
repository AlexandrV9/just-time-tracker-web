import { useMutation, useQuery } from "@tanstack/react-query";
import type { EmailVerificationStateDTO } from "@time-tracker/shared";
import { useCallback, useEffect, useState } from "react";
import { authActions } from "~/features/auth";
import { emailVerificationApiService } from "~/shared/api/services";
import { useNowMs, useTranslation } from "~/shared/hooks";
import { toast } from "~/shared/ui";
import { mapConfirmErrorKey, mapRequestErrorKey } from "./constants";

const baseLocale = "features.emailVerification";

export type EmailVerificationStep = "email" | "code";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const canResumePendingSession = (
  serverState: EmailVerificationStateDTO | null,
  email: string,
  isExpired: boolean,
) =>
  !isExpired &&
  serverState?.status === "pending" &&
  normalizeEmail(serverState.email ?? "") === normalizeEmail(email);

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
  const [viewStep, setViewStep] = useState<EmailVerificationStep | null>(null);

  const nowMs = useNowMs(enabled, serverState?.resendAvailableAt);
  const nowTs = nowMs ?? Date.now();

  const [codeResetKey, setCodeResetKey] = useState(0);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);

  const resetCodeInput = useCallback(() => {
    setCodeResetKey((key) => key + 1);
  }, []);

  const statusQuery = useQuery({
    queryKey: ["email-verification-status"],
    queryFn: () => emailVerificationApiService.getStatus(),
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
      setViewStep(null);
      setIsDailyLimitReached(false);
    }
  }, [enabled]);

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

  const isStatusLoading =
    enabled && statusQuery.isLoading && serverState === null;

  useEffect(() => {
    if (isStatusLoading || viewStep !== null) return;
    setViewStep(status === "none" ? "email" : "code");
  }, [isStatusLoading, status, viewStep]);

  useEffect(() => {
    if (status === "none" && viewStep === "code") {
      setViewStep("email");
    }
  }, [status, viewStep]);

  const step: EmailVerificationStep | null = isStatusLoading
    ? null
    : (viewStep ?? (status === "none" ? "email" : "code"));

  const resumePendingSession = useCallback(() => {
    setIsDailyLimitReached(false);
    setViewStep("code");
  }, []);

  const startMutation = useMutation({
    mutationFn: emailVerificationApiService.start,
    onSuccess: (response) => {
      if (!response.success) {
        if (response.message === "EMAIL_DAILY_LIMIT") {
          setIsDailyLimitReached(true);
        }
        toast.error(t(`${baseLocale}.${mapRequestErrorKey(response.message)}`));
        return;
      }
      setIsDailyLimitReached(false);
      setServerState(response.data);
      setViewStep("code");
      resetCodeInput();
      logDevCode(response.data.devCode);
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.requestFailed`));
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => emailVerificationApiService.resend(),
    onSuccess: (response) => {
      if (!response.success) {
        if (response.message === "EMAIL_DAILY_LIMIT") {
          setIsDailyLimitReached(true);
        }
        toast.error(t(`${baseLocale}.${mapRequestErrorKey(response.message)}`));
        return;
      }
      setIsDailyLimitReached(false);
      setServerState(response.data);
      setViewStep("code");
      resetCodeInput();
      logDevCode(response.data.devCode);
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.requestFailed`));
    },
  });

  const confirmMutation = useMutation({
    mutationFn: emailVerificationApiService.confirm,
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
        setViewStep("code");
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

  const cancelMutation = useMutation({
    mutationFn: () => emailVerificationApiService.cancel(),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.errors.requestFailed`));
        return;
      }
      setServerState(response.data);
      setViewStep("email");
      setIsDailyLimitReached(false);
      resetCodeInput();
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.requestFailed`));
    },
  });

  const start = useCallback(
    (email: string) => {
      const trimmed = email.trim();
      if (canResumePendingSession(serverState, trimmed, isExpired)) {
        resumePendingSession();
        return;
      }
      startMutation.mutate({ email: trimmed });
    },
    [isExpired, resumePendingSession, serverState, startMutation],
  );

  const confirm = useCallback(
    (code: string) => confirmMutation.mutate({ code }),
    [confirmMutation],
  );

  const resend = useCallback(() => {
    if (resendSecondsLeft > 0) return;
    resendMutation.mutate();
  }, [resendMutation, resendSecondsLeft]);

  const backToEmail = useCallback(() => {
    setViewStep("email");
    setIsDailyLimitReached(false);
    resetCodeInput();
  }, [resetCodeInput]);

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
    isDailyLimitReached,
    codeResetKey,
    start,
    confirm,
    resend,
    backToEmail,
    cancel,
  };
}
