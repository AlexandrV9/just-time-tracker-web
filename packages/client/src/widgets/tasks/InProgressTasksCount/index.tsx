import { useTranslation } from "~/shared/hooks";
import { Box, CircularLinesLoader, Stack, Text } from "~/shared/ui";

export const InProgressTasksCount = () => {
  const { t } = useTranslation();

  return (
    <Stack.HStack bg="bg.muted" p={5} borderRadius="4xl">
      <Box
        bg="bg.emphasized"
        color="bg.inverted"
        p={2}
        w="min-content"
        flexShrink={0}
        borderRadius="full"      >
        <CircularLinesLoader
          size={24}
          radius={30}
          lineWidth={7}
          lineLength={10}
          animated={true}
        />
      </Box>
      <Stack.VStack alignItems="start" gap={1}>
        <Text textStyle="lg" fontWeight="medium" lineHeight={1}>
          {t("widgets.inProgressTasksCount.title")}
        </Text>
        <Text textStyle="sm" color="fg.muted" lineHeight={1}>
          {t("widgets.inProgressTasksCount.count", { count: 0 })}
        </Text>
      </Stack.VStack>
    </Stack.HStack>
  );
};
