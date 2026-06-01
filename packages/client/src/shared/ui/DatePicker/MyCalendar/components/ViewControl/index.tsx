import { useTranslation } from "~/shared/hooks";
import { IconButton } from "~/shared/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "~/shared/ui/icons";
import { Stack } from "~/shared/ui/Stack";
import { Text } from "~/shared/ui/Text";
import { useCalendar } from "../../useCalendar";

export const ViewControl = () => {
  const { t, i18n } = useTranslation();
  const { month, goToNextMonth, goToPrevMonth } = useCalendar();

  return (
    <Stack.HStack justify="space-between" p={4} borderBottom="1px solid">
      <IconButton
        aria-label={t("common.aria.previousMonth")}
        size="sm"
        variant="ghost"
        onClick={goToPrevMonth}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Text fontWeight="semibold" textTransform="capitalize">
        {month.locale(i18n.language).format("MMMM YYYY")}
      </Text>

      <IconButton
        aria-label={t("common.aria.nextMonth")}
        size="sm"
        variant="ghost"
        onClick={goToNextMonth}
      >
        <ChevronRightIcon />
      </IconButton>
    </Stack.HStack>
  );
};
