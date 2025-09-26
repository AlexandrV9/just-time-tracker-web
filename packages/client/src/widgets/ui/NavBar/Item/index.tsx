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
            padding={3}
            color={isActive ? "purple.focusRing" : "gray"}
          >
            <Link to={href}>
              <Stack.VStack gap={1}>
                <Icon size={30} />
                <Text fontSize="xs" fontWeight="semibold">
                  {title}
                </Text>
              </Stack.VStack>
            </Link>
          </Button>
        </Box>
      </List.Item>
    );
  }
);
