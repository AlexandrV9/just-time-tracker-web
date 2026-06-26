import { Box, Card, Skeleton, Stack } from "~/shared/ui";

export const MotivationBlockSkeleton = () => (
  <Card.Root borderRadius="1rem">
    <Card.Header p="0.8rem" minHeight="60px">
      <Skeleton w="6rem" h="1.5rem" />
    </Card.Header>
    <Box h="1px" bg="border.emphasized" />
    <Card.Body display="flex" flexDirection="column" gap="1rem" p="0.8rem">
      <Stack.VStack alignItems="stretch" gap="0.5rem">
        <Skeleton w="10rem" h="1rem" />
        <Skeleton w="110px" h="2.5rem" borderRadius="md" />
      </Stack.VStack>
    </Card.Body>
  </Card.Root>
);
