import type { Task } from "~/shared/api/services/task";
import { Badge, Stack, Text } from "~/shared/ui";

export type TagListProps = {
  tags: Task["tags"];
};

export const TagList = ({ tags = [] }: TagListProps) => {
  return (
    <Stack.HStack justifyContent="space-between">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          px="0.7rem"
          py="0.2rem"
          flexShrink={0}
          colorPalette="gray"
          borderRadius="12px"
        >
          <Text textStyle="lg">{tag.title}</Text>
        </Badge>
      ))}
    </Stack.HStack>
  );
};
