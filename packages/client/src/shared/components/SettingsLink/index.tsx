import type { ReactNode } from "react";
import type { FileRouteTypes } from "~/routeTree.gen";
import { ChevronRightIcon, Flex, Link, List, Text } from "~/shared/ui";

export type SettingsLinkProps = {
  to: FileRouteTypes["to"];
  icon: ReactNode;
  label: string;
};

export const SettingsLink = ({ to, icon, label }: SettingsLinkProps) => (
  <List.Item display="flex" alignItems="center" gap="0.5rem">
    <Flex
      asChild
      width="full"
      display="grid"
      gap="0.3rem"
      py="0.5rem"
      gridTemplateColumns="min-content 1fr min-content"
      alignItems="start"
      textStyle="md"
    >
      <Link to={to}>
        <Flex h="1lh" alignItems="center" flexShrink={0}>
          {icon}
        </Flex>
        <Text as="span">{label}</Text>
        <Flex h="1lh" alignItems="center" flexShrink={0}>
          <ChevronRightIcon />
        </Flex>
      </Link>
    </Flex>
  </List.Item>
);
