import { memo, type ReactNode } from "react";
import {
  Box,
  Button,
  Link,
  List,
  Stack,
  Text,
  type IconProps,
} from "~/shared/ui";

export type NavBarItemProps = {
  id: string;
  title: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
  isActive?: boolean;
};

export const NavBarItem = memo(
  ({ href, isActive, icon: Icon, title }: NavBarItemProps) => {
    const linkContent = (
      <Link to={href}>
        <Stack.VStack gap={0.5}>
          <Icon size={24} />
          <Text fontSize="2xs" fontWeight="semibold" lineHeight="shorter">
            {title}
          </Text>
        </Stack.VStack>
      </Link>
    );

    return (
      <List.Item
        alignContent="center"
        justifyContent="center"
        alignItems="center"
      >
        <Box display="flex" justifyContent="center" alignItems="center">
          <Button
            variant="ghost"
            height="auto"
            _hover={{
              bg: "transparent",
            }}
            padding={1.5}
            color={isActive ? "purple.focusRing" : "gray"}
          >
            {linkContent}
          </Button>
        </Box>
      </List.Item>
    );
  },
);
