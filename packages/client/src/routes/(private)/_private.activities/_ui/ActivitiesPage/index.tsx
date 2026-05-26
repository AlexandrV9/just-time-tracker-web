import { Box } from "~/shared/ui";
import { ActivityList } from "~/widgets";

export const ActivitiesPage = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="stretch"
      flexGrow={1}
    >
      <ActivityList />
    </Box>
  );
};
