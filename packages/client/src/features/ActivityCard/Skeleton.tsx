import { ActivityCardView } from "~/entities/Activity";
import { Flex, Skeleton as BaseSkeleton } from "~/shared/ui";

export const Skeleton = () => {
  return (
    <ActivityCardView>
      <ActivityCardView.Body>
        <Flex flex="1" minH={0}>
          <BaseSkeleton w="5rem" h="1.2rem" />
        </Flex>
      </ActivityCardView.Body>
      <ActivityCardView.Footer>
        <BaseSkeleton w="4rem" h="1.2rem" />
      </ActivityCardView.Footer>
    </ActivityCardView>
  );
};
