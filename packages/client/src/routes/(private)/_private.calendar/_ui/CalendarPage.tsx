import { CreateTaskDialog } from "~/features/tasks";
import { Box, Flex, Text } from "~/shared/ui";
import { useDialog } from "@ark-ui/react";
import { useTranslation } from "~/shared/hooks";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { TimeGrid } from "./TimeGrid";

const routeApi = getRouteApi("/(private)/_private/calendar/");

const parseDateFromSearch = (value?: string): Date => {
  if (!value) return new Date();

  const parsed = dayjs(value, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed.toDate() : new Date();
};

export function CalendarPage() {
  const navigate = useNavigate();

  const routeSearch = routeApi.useSearch();
  const selectedDate = parseDateFromSearch(routeSearch.date);

  const { t } = useTranslation();

  const createTaskDialog = useDialog();

  const handleDateChange = (date: Date | null) => {
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, date: dayjs(date).format("YYYY-MM-DD") }),
    });
  };

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
        <CreateTaskDialog
          dialog={createTaskDialog}
          showTrigger
          initialStartDate={selectedDate}
        />
      </Flex>

      <TimeGrid startHour={8} endHour={18} hourHeight={60} />
      {/* <TaskList selectedDate={selectedDate} /> */}
    </Box>
  );
}
