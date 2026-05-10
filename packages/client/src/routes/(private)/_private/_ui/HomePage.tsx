import { Box, Flex } from "~/shared/ui";
import { ActivitityUnfinishedList, ActivityTodayList } from "~/widgets";
import { Stopwatch } from "./Stopwatch";

export function HomePage() {
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
      <Flex direction="column" p="0.5rem">
        <ActivityTodayList />
        <ActivitityUnfinishedList />
      </Flex>
    </Box>
  );
}
