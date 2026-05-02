import { Box, Flex } from "~/shared/ui";
import { ActivityTodayList } from "~/widgets";
import { Stopwatch } from "./Stopwatch";
import { useCurrentActivityStore } from "./useCurrentActivity";

export function HomePage() {
  const selectedActivityId = useCurrentActivityStore(
    (s) => s.selectedActivityId,
  );
  const toggleSelectedActivity = useCurrentActivityStore(
    (s) => s.toggleSelectedActivity,
  );
  const ensureSelectedActivity = useCurrentActivityStore(
    (s) => s.ensureSelectedActivity,
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="0.5rem"
      maxWidth="100vw"
    >
      <Flex justifyContent="center">
        <Stopwatch />
      </Flex>
      <ActivityTodayList
        selectedActivityId={selectedActivityId}
        onSelectActivity={toggleSelectedActivity}
        onEnsureSelectedActivity={ensureSelectedActivity}
      />
    </Box>
  );
}
