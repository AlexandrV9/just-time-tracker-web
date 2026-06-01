import { ActivityListView } from "~/entities/Activity";
import { Box, Flex, Skeleton as BaseSkeleton } from "~/shared/ui";

import { HistoryActivityCardSkeleton } from "./HistoryActivityCard/HistoryActivityCardSkeleton";

const CARD_COUNT = 3;

export const Skeleton = () => {
  return (
    <Box display="flex" flexDirection="column" gap="0.75rem">
      <Flex justifyContent="space-between" alignItems="center" gap="0.5rem">
        <BaseSkeleton w="6rem" h="1.2rem" />
        <Flex gap="0.25rem" alignItems="center">
          <BaseSkeleton w="8rem" h="1.2rem" />
        </Flex>
      </Flex>
      <ActivityListView>
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <ActivityListView.Item key={index}>
            <HistoryActivityCardSkeleton />
          </ActivityListView.Item>
        ))}
      </ActivityListView>
    </Box>
  );
};
