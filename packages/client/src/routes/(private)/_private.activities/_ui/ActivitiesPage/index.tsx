import { useDialog } from "@ark-ui/react";
import { Box, Button, Flex, Text } from "~/shared/ui";
import { ActivityList } from "./ActivityList";
import { CreateActivityDialog } from "./CreateActivityDialog";
import { useTranslation } from "~/shared/hooks";

export const ActivitiesPage = () => {
  const { t } = useTranslation();

  const createActivityDialog = useDialog();

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
      <Flex justifyContent="space-between" alignItems="center" gap="1rem">
        <Text textStyle="2xl" fontWeight="bolder">
          {t("pages.activities.title")}
        </Text>
        <Button
          variant="outline"
          borderRadius="xl"
          onClick={() => createActivityDialog.setOpen(true)}
        >
          {t("pages.activities.newActivityButton")}
        </Button>
      </Flex>
      <ActivityList />
      <CreateActivityDialog dialog={createActivityDialog} />
    </Box>
  );
};
