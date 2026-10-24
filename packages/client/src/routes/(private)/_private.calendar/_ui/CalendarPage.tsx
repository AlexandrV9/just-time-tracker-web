import { Box, Stack } from "~/shared/ui";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { WeekDatePicker } from "./WeekDatePicker";
import { parseDateFromSearch } from "~/shared/utils";
import { formatDate } from "~/shared/libs";
import { useTranslation } from "~/shared/hooks";
import { PlannedActivitiesList } from "~/widgets";

const routeApi = getRouteApi("/(private)/_private/calendar/");

export function CalendarPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const routeSearch = routeApi.useSearch();
  const selectedDate = parseDateFromSearch(routeSearch.date);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        date: formatDate(date, "YYYY-MM-DD", i18n.language),
      }),
    });
  };

  return (
    <Stack.VStack
      w="full"
      p="0.5rem"
      alignItems="stretch"
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
    >
      <WeekDatePicker value={selectedDate} onChange={handleDateChange} />
      <Box h="1px" w="full" bg="gray.800" my="0.5rem" borderRadius="full" />
      <PlannedActivitiesList selectedDate={selectedDate} />
    </Stack.VStack>
  );
}
