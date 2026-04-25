import { useNavigate, useSearch } from "@tanstack/react-router";
import { Box, Flex } from "~/shared/ui";
import { Stopwatch } from "./Stopwatch";
import { ActivityTodayList } from "~/widgets";

export function HomePage() {
  const { activityId } = useSearch({ from: "/(private)/_private/" });
  const navigate = useNavigate({ from: "/" });

  const handleSelectActivity = (id: string) => {
    navigate({
      to: "/",
      search: (prev) => ({
        ...prev,
        activityId: prev.activityId === id ? undefined : id,
      }),
    });
  };

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
        <Stopwatch selectedActivityId={activityId} />
      </Flex>
      <ActivityTodayList
        selectedActivityId={activityId}
        onSelectActivity={handleSelectActivity}
      />
    </Box>
  );
}
