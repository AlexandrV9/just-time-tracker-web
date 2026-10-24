import { Button, RetryAfterMessage, Text } from "~/shared/ui";
import type { useEmailVerification } from "../../useEmailVerification";
import { useTranslation } from "~/shared/hooks";

type EmailVerificationResendButtonProps = Pick<
  ReturnType<typeof useEmailVerification>,
  | "isExpired"
  | "resendSecondsLeft"
  | "verifyLockSecondsLeft"
  | "canResend"
  | "isResendPending"
  | "resend"
>;

export function EmailVerificationResendButton({
  isExpired,
  resendSecondsLeft,
  verifyLockSecondsLeft,
  resend,
  canResend,
  isResendPending,
}: EmailVerificationResendButtonProps) {
  const { t } = useTranslation();

  if (!isExpired && verifyLockSecondsLeft > 0) {
    return <RetryAfterMessage secondsLeft={verifyLockSecondsLeft} />;
  }

  if (!isExpired && resendSecondsLeft > 0) {
    return (
      <Text color="fg.muted" textStyle="sm">
        {t(`features.emailVerification.resendIn`, {
          seconds: resendSecondsLeft,
        })}
      </Text>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={resend}
      disabled={!canResend || isResendPending}
      loading={isResendPending}
    >
      {t(`features.emailVerification.resendButton`)}
    </Button>
  );
}
