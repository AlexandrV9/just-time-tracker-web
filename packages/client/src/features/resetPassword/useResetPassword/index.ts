import { useMutation, useQuery } from "@tanstack/react-query";
import type { PasswordResetStatusDTO } from "@to-do-list/shared";
import { useCallback, useEffect, useState } from "react";
import { authService } from "~/shared/api/services/auth";
import { useNowMs, useTranslation } from "~/shared/hooks";
import { toast } from "~/shared/ui";
import { logDevCode, mapCodeErrorKey, mapStartErrorKey } from "./utils";

const baseLocale = "features.resetPassword";

export type ResetPasswordStep = "email" | "code" | "password";

type UseResetPasswordOptions = {
  recoveryEmail?: string;
  onRecoveryEmailChange: (email: string | undefined) => void;
  onDone: () => void;
};

export function useResetPassword({
  recoveryEmail,
  onRecoveryEmailChange,
  onDone,
}: UseResetPasswordOptions) {
  const { t } = useTranslation();

  const [serverState, setServerState] =
    useState<PasswordResetStatusDTO | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [codeResetKey, setCodeResetKey] = useState(0);

  const resetCodeInput = useCallback(() => {
    setCodeResetKey((key) => key + 1);
  }, []);

  const statusQuery = useQuery({
    queryKey: ["password-reset-status", recoveryEmail],
    queryFn: () =>
      authService.getPasswordResetStatus({ email: recoveryEmail!.trim() }),
    enabled: !!recoveryEmail?.trim() && resetToken === null,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

  useEffect(() => {
    if (statusQuery.data?.success) {
      setServerState(statusQuery.data.data);
    }
  }, [statusQuery.data]);

  useEffect(() => {
    if (!recoveryEmail?.trim()) {
      setServerState(null);
    }
  }, [recoveryEmail]);

  const status = serverState?.status ?? "none";
  const email = serverState?.email ?? recoveryEmail?.trim() ?? "";
  const expiresAt = serverState?.expiresAt;
  const resendAvailableAt = serverState?.resendAvailableAt;

  const nowMs = useNowMs(
    status === "pending" || status === "expired",
    resendAvailableAt,
  );
  const nowTs = nowMs ?? Date.now();

  const isExpired =
    status === "expired" ||
    (status === "pending" && !!expiresAt && Date.parse(expiresAt) <= nowTs);

  const resendSecondsLeft = resendAvailableAt
    ? Math.max(0, Math.floor((Date.parse(resendAvailableAt) - nowTs) / 1000))
    : 0;

  const isStatusLoading =
    !!recoveryEmail?.trim() &&
    resetToken === null &&
    statusQuery.isLoading &&
    serverState === null;

  const step: ResetPasswordStep | null = resetToken
    ? "password"
    : isStatusLoading
      ? null
      : status === "none"
        ? "email"
        : "code";

  const applyPendingState = useCallback(
    (data: PasswordResetStatusDTO & { status: "pending" }) => {
      setServerState(data);
      onRecoveryEmailChange(data.email);
    },
    [onRecoveryEmailChange],
  );

  const startMutation = useMutation({
    mutationFn: authService.startPasswordReset,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.${mapStartErrorKey(response.message)}`));
        return;
      }
      applyPendingState(response.data);
      setResetToken(null);
      resetCodeInput();
      logDevCode(response.data.devCode);
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.requestFailed`));
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.resendPasswordReset({ email }),
    onSuccess: (response) => {
      if (!response.success) {
        if (response.message === "USER_NOT_FOUND") {
          setServerState({ status: "none" });
          onRecoveryEmailChange(undefined);
        }
        const key =
          response.message === "RESEND_TOO_EARLY"
            ? "errors.resendTooEarly"
            : mapStartErrorKey(response.message);
        toast.error(t(`${baseLocale}.${key}`));
        return;
      }
      applyPendingState(response.data);
      resetCodeInput();
      logDevCode(response.data.devCode);
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.requestFailed`));
    },
  });

  const verifyMutation = useMutation({
    mutationFn: authService.verifyPasswordReset,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.${mapCodeErrorKey(response.message)}`));
        if (response.message === "INVALID_CODE") {
          resetCodeInput();
        }
        if (response.message === "TOO_MANY_ATTEMPTS") {
          resetCodeInput();
          const next = (
            response.data as { resendAvailableAt?: string } | undefined
          )?.resendAvailableAt;
          if (next) {
            setServerState((prev) =>
              prev && prev.status !== "none"
                ? { ...prev, resendAvailableAt: next }
                : prev,
            );
          }
        }
        return;
      }

      if (response.data.status === "expired") {
        setServerState({ status: "expired", email });
        resetCodeInput();
        toast.error(t(`${baseLocale}.errors.codeExpired`));
        return;
      }

      setResetToken(response.data.resetToken);
    },
    onError: () => {
      resetCodeInput();
      toast.error(t(`${baseLocale}.errors.verifyFailed`));
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (newPassword: string) =>
      authService.confirmPasswordReset({
        resetToken: resetToken ?? "",
        newPassword,
      }),
    onSuccess: (response) => {
      if (!response.success) {
        if (response.message === "SAME_PASSWORD") {
          toast.error(t(`${baseLocale}.errors.samePassword`));
          return;
        }
        if (
          response.message === "RESET_TOKEN_INVALID" ||
          response.message === "CODE_NOT_FOUND"
        ) {
          toast.error(t(`${baseLocale}.errors.sessionExpired`));
          setResetToken(null);
          setServerState({ status: "none" });
          onRecoveryEmailChange(undefined);
          return;
        }
        toast.error(t(`${baseLocale}.errors.confirmFailed`));
        return;
      }

      if (response.data.status === "expired") {
        toast.error(t(`${baseLocale}.errors.sessionExpired`));
        setResetToken(null);
        setServerState({ status: "expired", email });
        return;
      }

      toast.success(t(`${baseLocale}.success`));
      onRecoveryEmailChange(undefined);
      onDone();
    },
    onError: () => {
      toast.error(t(`${baseLocale}.errors.confirmFailed`));
    },
  });

  const start = useCallback(
    (value: string) => startMutation.mutate({ email: value }),
    [startMutation],
  );

  const verify = useCallback(
    (code: string) => verifyMutation.mutate({ email, code }),
    [verifyMutation, email],
  );

  const resend = useCallback(() => {
    if (resendSecondsLeft > 0) return;
    resendMutation.mutate();
  }, [resendMutation, resendSecondsLeft]);

  const confirm = useCallback(
    (newPassword: string) => confirmMutation.mutate(newPassword),
    [confirmMutation],
  );

  const backToEmail = useCallback(() => {
    setResetToken(null);
    setServerState({ status: "none" });
    onRecoveryEmailChange(undefined);
    resetCodeInput();
  }, [onRecoveryEmailChange, resetCodeInput]);

  return {
    step,
    email,
    isExpired,
    resendSecondsLeft,
    canResend: resendSecondsLeft <= 0,
    isStatusLoading,
    codeResetKey,
    isStartPending: startMutation.isPending,
    isVerifyPending: verifyMutation.isPending,
    isResendPending: resendMutation.isPending,
    isConfirmPending: confirmMutation.isPending,
    start,
    verify,
    resend,
    confirm,
    backToEmail,
  };
}
