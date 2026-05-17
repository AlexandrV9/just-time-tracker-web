import { Card, Flex, Skeleton as BaseSkeleton } from "~/shared/ui";
import { ActivityCardViewBody } from "../ActivityCardViewBody";
import { ActivityCardViewFooter } from "../ActivityCardViewFooter";

export const ActivityCardViewSkeleton = () => {
  return (
    <Card.Root
      flex="1"
      w="100%"
      minH="clamp(7.5rem, 28vw, 10rem)"
      h="100%"
      display="flex"
      flexDirection="column"
      p="0.8rem"
      borderRadius="2xl"
      gap="1rem"
      overflow="hidden"
    >
      <ActivityCardViewBody>
        <Flex flex="1" minH={0}>
          <BaseSkeleton w="5rem" h="1.2rem" />
        </Flex>
      </ActivityCardViewBody>
      <ActivityCardViewFooter>
        <BaseSkeleton w="4rem" h="1.2rem" />
      </ActivityCardViewFooter>
    </Card.Root>
  );
};
