import { ActivityListView } from "~/entities/Activity";
import { ActivityCard } from "~/features";
import { Box, Flex, Text } from "~/shared/ui";

import { Skeleton as BaseSkeleton } from "~/shared/ui";

export const Skeleton = () => {
  return (
    <Box display="flex" flexDirection="column" gap="0.75rem">
      <Flex justifyContent="space-between" alignItems="center" px={1}>
        <BaseSkeleton w="6rem" h="1.2rem" />
        <Flex gap="0.25rem" alignItems="center">
          <BaseSkeleton w="8rem" h="1.2rem" />
        </Flex>
      </Flex>
      <ActivityListView>
        {Array.from({ length: 4 }).map((_, index) => (
          <ActivityListView.Item key={index}>
            <ActivityCard.Skeleton />
          </ActivityListView.Item>
        ))}
      </ActivityListView>
    </Box>
  );
};
