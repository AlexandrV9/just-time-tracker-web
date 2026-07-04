import { useTranslation } from "~/shared/hooks";
import { formatCountdownTime } from "~/shared/libs/rateLimit";
import { Text } from "../Text";

type RetryAfterMessageProps = {
  secondsLeft: number;
  localeKey?: string;
};

export function RetryAfterMessage({
  secondsLeft,
  localeKey = "common.retryAfter",
}: RetryAfterMessageProps) {
  const { t } = useTranslation();

  if (secondsLeft <= 0) return null;

  return (
    <Text color="fg.error" textStyle="sm">
      {t(localeKey, { time: formatCountdownTime(secondsLeft) })}
    </Text>
  );
}
