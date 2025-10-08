import {
  Badge,
  Box,
  Card,
  ClockIcon,
  Stack,
  Text,
  type BadgeProps,
} from "~/shared/ui";
import type { Task } from "../../types";
import dayjs from "dayjs";
import { memo, type ReactNode } from "react";

export interface TaskCardProps {
  data: Task;
  actionSlot?: ReactNode;
}

const statusColors: Partial<
  Record<Task["status"], BadgeProps["colorPalette"]>
> = {
  done: "green",
  in_progress: "cyan",
  todo: "orange",
};

export const TaskCard = memo(({ data, actionSlot }: TaskCardProps) => {
  const { title, description, startDate, status, tags, id: taskId } = data;

  return (
    <Card.Root
      p="0.6rem"
      w="full"
      display="flex"
      flexDirection="column"
      gap="0.5rem"
    >
      <Stack.HStack justifyContent="space-between">
        {tags && (
          <Stack.HStack justifyContent="space-between">
            {tags.map((tag) => (
              <Badge
                px="0.7rem"
                py="0.2rem"
                key={`${taskId}_${tag}`}
                flexShrink={0}
                colorPalette="gray"
                borderRadius="12px"
              >
                {tag}
              </Badge>
            ))}
          </Stack.HStack>
        )}

        {actionSlot}
      </Stack.HStack>

      <Text fontSize="l">{title}</Text>

      <Stack.HStack justifyContent="space-between">
        <Text color="gray" fontSize="small">
          {description}
        </Text>
      </Stack.HStack>

      <Stack.HStack
        gap="0.1rem"
        align="center"
        justifyContent="space-between"
        color="purple.focusRing"
      >
        <Box
          display="flex"
          gap="0.1rem"
          alignItems="center"
          justifyContent="space-between"
          color="purple.focusRing"
        >
          <ClockIcon size={18} />
          <Text fontSize={15} fontWeight="medium">
            {dayjs(startDate).format("HH:mm")}
          </Text>
        </Box>
        {status && (
          <Badge
            flexShrink={0}
            colorPalette={statusColors[status]}
            borderRadius="12px"
            size="md"
          >
            {status}
          </Badge>
        )}
      </Stack.HStack>
    </Card.Root>
  );
}, arePropsEqual);

function arePropsEqual(oldProps: TaskCardProps, newProps: TaskCardProps) {
  const oldData = oldProps.data;
  const newData = newProps.data;

  return (
    oldData.id === newData.id &&
    oldData.title === newProps.data.title &&
    oldData.startDate === newData.startDate &&
    oldData.status === newData.status &&
    oldProps.actionSlot === newProps.actionSlot
  );
}
