import { Badge, Stack } from "~/shared/ui";

export type TagListProps = {
  tags: string[];
};

export const TagList = ({ tags }: TagListProps) => {
  return (
    <Stack.HStack justifyContent="space-between">
      {tags.map((tag) => (
        <Badge
          key={tag}
          px="0.7rem"
          py="0.2rem"
          flexShrink={0}
          colorPalette="gray"
          borderRadius="12px"
        >
          {tag}
        </Badge>
      ))}
    </Stack.HStack>
  );
};
