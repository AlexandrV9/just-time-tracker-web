import { IconButton } from "~/shared/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "~/shared/ui/icons";
import { Stack } from "~/shared/ui/Stack";
import { Text } from "~/shared/ui/Text";
import { useCalendar } from "../../useCalendar";

const locale = "ru";

export const ViewControl = () => {
  const { month, goToNextMonth, goToPrevMonth } = useCalendar();

  return (
    <Stack.HStack justify="space-between" p={4} borderBottom="1px solid">
      <IconButton
        aria-label="Previous month"
        size="sm"
        variant="ghost"
        onClick={goToPrevMonth}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Text
        // fontSize={sizeStyles.fontSize}
        fontWeight="semibold"
        //   color={textColor}
        textTransform="capitalize"
      >
        {month.locale(locale).format("MMMM YYYY")}
      </Text>

      <IconButton
        aria-label="Next month"
        size="sm"
        variant="ghost"
        onClick={goToNextMonth}
      >
        <ChevronRightIcon />
      </IconButton>
    </Stack.HStack>
  );
};
