import type { TFunction } from "i18next";
import { Button, Text } from "~/shared/ui";
import type { useEmailVerification } from "../../useEmailVerification";

const baseLocale = "features.emailVerification";

type EmailVerificationResendSlotProps = {
  ev: Pick<
    ReturnType<typeof useEmailVerification>,
    | "isExpired"
    | "resendSecondsLeft"
    | "canResend"
    | "isResendPending"
    | "resend"
  >;
  t: TFunction<"translation", undefined>;
};

export function EmailVerificationResendSlot({
  ev,
  t,
}: EmailVerificationResendSlotProps) {
  if (!ev.isExpired && ev.resendSecondsLeft > 0) {
    return (
      <Text color="fg.muted" textStyle="sm">
        {t(`${baseLocale}.resendIn`, { seconds: ev.resendSecondsLeft })}
      </Text>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={ev.resend}
      disabled={!ev.canResend || ev.isResendPending}
      loading={ev.isResendPending}
    >
      {t(`${baseLocale}.resendButton`)}
    </Button>
  );
}
