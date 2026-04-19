import { Box } from "~/shared/ui";
import { ActivityHistory } from "~/widgets";

export const HistoryPage = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
      gap="1rem"
      px={2}
      py={5}
      maxWidth="100vw"
    >
      <ActivityHistory />
    </Box>
  );
};
