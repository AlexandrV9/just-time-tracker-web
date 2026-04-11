import { Box, Flex, Tabs } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import { Stopwatch } from "./Stopwatch";
import { ActivityList } from "./ActivityList";
import { useHomeStopwatchSession } from "./useHomeStopwatchSession";
import { DayPlanList } from "./DayPlanList";

export function HomePage() {
  const { t } = useTranslation();
  const { seconds, status, start, pause, stop } = useHomeStopwatchSession();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="1rem"
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
        defaultValue="today"
        variant="plain"
        fitted
        w="full"
        css={{
          "--tabs-indicator-bg": "colors.bg.emphasized",
          "--tabs-indicator-shadow": "none",
        }}
      >
        <Tabs.List w="full" gap="0" bg="bg.subtle" rounded="l3" p="1">
          <Tabs.Trigger
            value="today"
            flex="1"
            py="2"
            fontSize="sm"
            fontWeight="medium"
            color="fg.muted"
            rounded="md"
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
            rounded="md"
            zIndex={1}
            _selected={{ color: "fg" }}
          >
            {t("pages.home.tabHistory")}
          </Tabs.Trigger>
          <Tabs.Indicator rounded="md" />
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
