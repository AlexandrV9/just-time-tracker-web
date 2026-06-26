import { Box, Card, Flex, Skeleton, Stack } from "~/shared/ui";

const ToggleRowSkeleton = () => (
  <Flex alignItems="center" gap={3}>
    <Skeleton w="36px" h="20px" borderRadius="full" flexShrink={0} />
    <Skeleton w="12rem" h="1rem" />
  </Flex>
);

const DurationFieldSkeleton = () => (
  <Stack.VStack alignItems="stretch" gap="0.5rem" pl="3rem">
    <Skeleton w="8rem" h="1rem" />
    <Skeleton w="110px" h="2.5rem" borderRadius="md" />
  </Stack.VStack>
);

export const NotificationsBlockSkeleton = () => (
  <Card.Root borderRadius="1rem">
    <Card.Header p="0.8rem" minHeight="60px">
      <Skeleton w="7rem" h="1.5rem" />
    </Card.Header>
    <Box h="1px" bg="border.emphasized" />
    <Card.Body display="flex" flexDirection="column" gap="1rem" p="0.8rem">
      <ToggleRowSkeleton />
      <Stack.VStack alignItems="stretch" gap="0.75rem">
        <ToggleRowSkeleton />
        <DurationFieldSkeleton />
      </Stack.VStack>
      <Stack.VStack alignItems="stretch" gap="0.75rem">
        <ToggleRowSkeleton />
        <DurationFieldSkeleton />
      </Stack.VStack>
    </Card.Body>
  </Card.Root>
);
