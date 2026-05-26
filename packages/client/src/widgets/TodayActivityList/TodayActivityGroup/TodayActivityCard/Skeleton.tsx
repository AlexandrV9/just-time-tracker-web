import { ActivityCardView } from "~/entities/Activity";
import { Flex, Skeleton as BaseSkeleton } from "~/shared/ui";

export const Skeleton = () => {
  return (
    <ActivityCardView>
      <ActivityCardView.Body>
        <Flex flex="1" minH={0} direction="column" gap={2} w="full">
          <BaseSkeleton w="70%" h="1.2rem" />
          <BaseSkeleton w="40%" h="0.75rem" />
        </Flex>
      </ActivityCardView.Body>
      <ActivityCardView.Footer>
        <BaseSkeleton w="4rem" h="1.2rem" />
      </ActivityCardView.Footer>
    </ActivityCardView>
  );
};
