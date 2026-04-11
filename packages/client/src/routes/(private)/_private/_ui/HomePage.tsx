import { useCallback } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { Box, Flex, Tabs } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import { Stopwatch } from "./Stopwatch";
import { ActivityList } from "../../../../widgets/ActivityList";
import { useHomeStopwatchSession } from "./useHomeStopwatchSession";
import { DayPlanList } from "./DayPlanList";

const homeRouteApi = getRouteApi("/(private)/_private/");

export function HomePage() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { tab } = homeRouteApi.useSearch();

  const { seconds, status, start, pause, stop } = useHomeStopwatchSession();

  const handleTabChange = useCallback(
    (details: { value: string | null }) => {
      const next = details.value;
      if (next !== "today" && next !== "history") return;
      navigate({
        to: "/",
        search: (prev) => ({ ...prev, tab: next }),
      });
    },
    [navigate],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="0.5rem"
      p={2}
      maxWidth="100vw"
    >
      <Flex justifyContent="center">
        <Stopwatch
          seconds={seconds}
          status={status}
          onStart={start}
          onPause={pause}
          onFinish={stop}
        />
      </Flex>
      <Tabs.Root
        value={tab}
        onValueChange={handleTabChange}
        variant="plain"
        fitted
        w="full"
        size="sm"
      >
        <Tabs.List
          w="full"
          gap="0"
          bg="bg.muted"
          rounded="4xl"
          p="0.2rem"
          border="1px solid"
          borderColor="border.emphasized"
        >
          <Tabs.Trigger
            value="today"
            flex="1"
            py="2"
            fontSize="sm"
            fontWeight="medium"
            color="fg.muted"
            zIndex={1}
            _selected={{ color: "fg" }}
          >
            {t("pages.home.tabToday")}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="history"
            flex="1"
            py="2"
            fontSize="sm"
            fontWeight="medium"
            color="fg.muted"
            zIndex={1}
            _selected={{ color: "fg" }}
          >
            {t("pages.home.tabHistory")}
          </Tabs.Trigger>
          <Tabs.Indicator rounded="2xl" />
        </Tabs.List>
        <Tabs.Content value="today" pt={3}>
          <DayPlanList />
        </Tabs.Content>
        <Tabs.Content value="history" pt={3}>
          <ActivityList />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
