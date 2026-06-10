import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { authService } from "~/shared/api/services/auth";
import { useTranslation } from "~/shared/hooks";
import { toast } from "~/shared/ui";

const baseLocale = "features.passwordReset";

export type PasswordResetStep = "email" | "code" | "password";

const mapCodeErrorKey = (message?: string) => {
  switch (message) {
    case "INVALID_CODE":
      return "errors.invalidCode";
    case "TOO_MANY_ATTEMPTS":
      return "errors.tooManyAttempts";
    default:
      return "errors.verifyFailed";
  }
};

const logDevCode = (devCode?: string) => {
  if (devCode) {
    console.info("[dev] password reset code:", devCode);
  }
};

type UsePasswordResetOptions = {
  onDone: () => void;
};

export function usePasswordReset({ onDone }: UsePasswordResetOptions) {
  const { t } = useTranslation();

  const [step, setStep] = useState<PasswordResetStep>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | undefined>();
  const [resendAvailableAt, setResendAvailableAt] = useState<
    string | undefined
  >();
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [codeResetKey, setCodeResetKey] = useState(0);

  const resetCodeInput = useCallback(() => {
    setCodeResetKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (resendAvailableAt) setNowTs(Date.now());
  }, [resendAvailableAt]);

  const isExpired = !!expiresAt && Date.parse(expiresAt) <= nowTs;

  const resendSecondsLeft = resendAvailableAt
    ? Math.max(0, Math.floor((Date.parse(resendAvailableAt) - nowTs) / 1000))
    : 0;

  const startMutation = useMutation({
    mutationFn: authService.startPasswordReset,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.errors.requestFailed`));
        return;
      }
      setEmail(response.data.email);
      setExpiresAt(response.data.expiresAt);
      setResendAvailableAt(response.data.resendAvailableAt);
      setResetToken(null);
      resetCodeInput();
      setStep("code");
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
        const key =
          response.message === "RESEND_TOO_EARLY"
            ? "errors.resendTooEarly"
            : "errors.requestFailed";
        toast.error(t(`${baseLocale}.${key}`));
        return;
      }
      setExpiresAt(response.data.expiresAt);
      setResendAvailableAt(response.data.resendAvailableAt);
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
          if (next) setResendAvailableAt(next);
        }
        return;
      }

      if (response.data.status === "expired") {
        setExpiresAt(new Date(0).toISOString());
        resetCodeInput();
        toast.error(t(`${baseLocale}.errors.codeExpired`));
        return;
      }

      setResetToken(response.data.resetToken);
      setStep("password");
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
          setStep("email");
          return;
        }
        toast.error(t(`${baseLocale}.errors.confirmFailed`));
        return;
      }

      if (response.data.status === "expired") {
        toast.error(t(`${baseLocale}.errors.sessionExpired`));
        setStep("email");
        return;
      }

      toast.success(t(`${baseLocale}.success`));
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
    setStep("email");
    setResetToken(null);
    resetCodeInput();
  }, [resetCodeInput]);

  return {
    step,
    email,
    isExpired,
    resendSecondsLeft,
    canResend: resendSecondsLeft <= 0,
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
