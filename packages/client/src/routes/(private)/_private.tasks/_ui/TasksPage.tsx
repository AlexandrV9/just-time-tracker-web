import { CreateTaskDialog } from "~/features/tasks";
import { TaskList } from "~/features/tasks/TaskList";
import { Box, Flex, Text } from "~/shared/ui";
import { WeekDatePicker } from "./WeekDatePicker";
import { useDialog } from "@ark-ui/react";
import { useTranslation } from "~/shared/hooks";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";

const routeApi = getRouteApi("/(private)/_private/tasks/");

const parseDateFromSearch = (value?: string): Date => {
  if (!value) return new Date();

  const parsed = dayjs(value, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed.toDate() : new Date();
};

export function TasksPage() {
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
      gap="1rem"
    >
      <WeekDatePicker value={selectedDate} onChange={handleDateChange} />
      <Flex justify="space-between" alignItems="center">
        <Text textStyle="2xl" fontWeight="extrabold">
          {t("pages.tasksPage.title")}
        </Text>
        <CreateTaskDialog
          dialog={createTaskDialog}
          showTrigger
          initialStartDate={selectedDate}
        />
      </Flex>
      <Box h="1px" w="full" bg="gray.800" borderRadius="full" />
      <TaskList selectedDate={selectedDate} />
    </Box>
  );
}
