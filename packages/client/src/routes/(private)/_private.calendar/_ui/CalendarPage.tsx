import { Box, Flex, Text } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";

export function CalendarPage() {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap={0.5}
    >
      {/* <DateNavigator value={selectedDate} onChange={handleDateChange} /> */}
      <Flex p="1rem" flexDirection="column" gap="1rem">
        <Text textStyle="2xl" fontWeight="extrabold">
          {t("pages.calendar.title")}
        </Text>
        <Text>{t("pages.calendar.comingSoon")}</Text>
        <Text textStyle="sm" color="fg.muted">
          {t("pages.calendar.comingSoonDescription")}
        </Text>
      </Flex>
      {/* <TimeGrid startHour={8} endHour={18} hourHeight={60} /> */}
      {/* <TaskList selectedDate={selectedDate} /> */}
    </Box>
  );
}
