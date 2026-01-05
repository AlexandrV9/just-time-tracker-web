import { Card, SkeletonPropsProvider, SkeletonText } from "@chakra-ui/react";
import { Skeleton as BaseSkeleton, Flex, Stack } from "~/shared/ui";

export const Skeleton = () => {
  return (
    <Card.Root
      p="0.6rem"
      w="full"
      display="flex"
      flexDirection="column"
      gap="0.5rem"
    >
      <SkeletonPropsProvider value={{ variant: "shine" }}>
        <Stack.HStack
          alignItems="center"
          justifyContent="space-between"
          width="full"
        >
          <BaseSkeleton h="18px" width="30%" />
          <Flex gap={2}>
            <BaseSkeleton height="36px" w="36px" />
            <BaseSkeleton height="36px" w="36px" />
          </Flex>
        </Stack.HStack>

        <SkeletonText noOfLines={2} height="14px" />

        <Flex justifyContent="space-between" alignItems="center">
          <BaseSkeleton height="18px" w="60px" />
          <BaseSkeleton height="18px" w="50px" borderRadius={10} />
        </Flex>
      </SkeletonPropsProvider>
    </Card.Root>
  );
};
