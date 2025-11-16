import {
  Badge,
  Box,
  Card,
  ClockIcon,
  Stack,
  Text,
  type BadgeProps,
} from "~/shared/ui";
import dayjs from "dayjs";
import { type ReactNode } from "react";
import { TagList } from "./TagList";
import type { Task } from "~/shared/api/services/task";

export interface TaskCardProps {
  task: Task;
  actionSlot?: ReactNode;
}

const statusColors: Partial<
  Record<Task["status"], BadgeProps["colorPalette"]>
> = {
  done: "green",
  in_progress: "cyan",
  todo: "orange",
};

export const TaskCard = ({ task, actionSlot }: TaskCardProps) => {
  const { title, description, startDate, status, tags = [], isDeleting } = task;

  const isHasTags = tags.length !== 0;

  const titleElement = <Text fontSize="l">{title}</Text>;

  return (
    <Card.Root
      p="0.6rem"
      w="full"
      display="flex"
      flexDirection="column"
      gap="0.5rem"
    >
      <Stack.HStack justifyContent="space-between">
        {isHasTags ? <TagList tags={tags} /> : titleElement}
        {actionSlot}
      </Stack.HStack>

      {isHasTags && titleElement}

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
        {task.syncStatus}
        {" "}
        {task.isDeleting && "Удаление"}
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
};
// }, arePropsEqual);

// function arePropsEqual(oldProps: TaskCardProps, newProps: TaskCardProps) {
//   const oldData = oldProps.task;
//   const newData = newProps.task;

//   return (
//     oldData.id === newData.id &&
//     oldData.title === newProps.task.title &&
//     oldData.startDate === newData.startDate &&
//     oldData.status === newData.status &&
//     oldProps.actionSlot === newProps.actionSlot
//   );
// }
