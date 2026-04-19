import { Box, Flex, Text } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import { TimeGrid } from "./TimeGrid";

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
      <Flex
        justify="space-between"
        alignItems="center"
        position="sticky"
        top={0}
        zIndex={2}
        px={4}
        py={4}
      >
        <Text textStyle="2xl" fontWeight="extrabold">
          {t("pages.calendar.title")}
        </Text>
      </Flex>

      <TimeGrid startHour={8} endHour={18} hourHeight={60} />
      {/* <TaskList selectedDate={selectedDate} /> */}
    </Box>
  );
}
