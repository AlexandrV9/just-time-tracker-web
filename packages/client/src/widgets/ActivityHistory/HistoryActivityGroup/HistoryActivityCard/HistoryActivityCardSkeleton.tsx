import { ActivityCardView } from "~/entities/Activity";
import { Flex, Skeleton as BaseSkeleton } from "~/shared/ui";

export const HistoryActivityCardSkeleton = () => {
  return (
    <ActivityCardView>
      <ActivityCardView.Body>
        <Flex flex="1" minH={0} direction="column" gap={2} w="full">
          <BaseSkeleton w="70%" h="1.2rem" />
        </Flex>
      </ActivityCardView.Body>
      <ActivityCardView.Footer>
        <Flex justifyContent="flex-end" gap="0.5rem" w="full">
          <BaseSkeleton w="3rem" h="1rem" />
          <BaseSkeleton w="3rem" h="1rem" />
        </Flex>
      </ActivityCardView.Footer>
    </ActivityCardView>
  );
};
