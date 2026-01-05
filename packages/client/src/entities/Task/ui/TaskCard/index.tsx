import { Badge, Card, Flex, Stack, Text } from "~/shared/ui";
import type { Task } from "~/shared/api/services/task";
import { TagList } from "./TagList";
import { Skeleton } from "./Skeleton";
import { TimeAxis } from "./TimeAxis";
import { Box, Grid } from "@chakra-ui/react";
import { type ReactNode } from "react";

export interface TaskCardProps {
  task: Task;
  withTimeAxis?: boolean;
  actionSlot?: ReactNode;
}

export function TaskCard({
  task,
  actionSlot,
  withTimeAxis = true,
}: TaskCardProps) {
  const { title, description, priority, startDate, endDate, tags = [] } = task;

  return (
    <Grid templateColumns={withTimeAxis ? "auto 1fr" : "auto"}>
      {withTimeAxis && startDate && endDate && (
        <TimeAxis startDate={startDate} endDate={endDate} />
      )}
      <Card.Root
        p="1rem"
        w="full"
        display="flex"
        gap="0.8rem"
        flexDirection="column"
        borderRadius="1rem"
      >
        <Stack.HStack justifyContent="space-between">
          {tags && <TagList tags={tags} />}
          <Box ml="auto">{actionSlot}</Box>
        </Stack.HStack>
        <Grid templateColumns="1fr min-content" gap="1rem" alignItems="center">
          <Stack.VStack alignItems="start" overflow="hidden">
            <Text fontSize="xl" fontWeight="semibold" truncate w="full">
              {title}
            </Text>
            <Text color="gray" fontSize="small" lineClamp={4}>
              {description}
            </Text>
          </Stack.VStack>
        </Grid>
        <Flex justifyContent="start">
          <Stack.HStack>
            Priority:
            <Badge size="lg" borderRadius="full" px="1rem">
              {priority}
            </Badge>
          </Stack.HStack>
        </Flex>
      </Card.Root>
    </Grid>
  );
}

TaskCard.Skeleton = Skeleton;
