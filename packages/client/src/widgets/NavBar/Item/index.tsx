import { memo, type ReactNode } from "react";
import {
  Box,
  Flex,
  Link,
  List,
  Stack,
  Text,
  type IconProps,
} from "~/shared/ui";

import styles from "./NavBarItem.module.css";

export type NavBarItemProps = {
  id: string;
  title: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
  isActive?: boolean;
  isHideText?: boolean;
};

export const NavBarItem = memo(
  ({
    href,
    isActive,
    icon: Icon,
    title,
    isHideText = false,
  }: NavBarItemProps) => {
    return (
      <List.Item
        alignContent="center"
        justifyContent="center"
        alignItems="center"
      >
        <Flex justify="center" align="center">
          <Box
            asChild
            padding={1.5}
            color={isActive ? "purple.focusRing" : "gray"}
          >
            <Link to={href}>
              <Stack.VStack gap={{ base: 1, md: 1.5 }}>
                <Box className={styles.iconWrap}>
                  <Icon size={24} />
                </Box>
                {!isHideText && (
                  <Text
                    fontSize={{ base: "xs", "2xl": "md" }}
                    fontWeight="semibold"
                    lineHeight="shorter"
                  >
                    {title}
                  </Text>
                )}
              </Stack.VStack>
            </Link>
          </Box>
        </Flex>
      </List.Item>
    );
  },
);
