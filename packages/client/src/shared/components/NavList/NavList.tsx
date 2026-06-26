import type { ReactNode } from "react";
import type { FileRouteTypes } from "~/routeTree.gen";
import { ChevronRightIcon, Flex, Link, List, Text } from "~/shared/ui";

export type NavListItemProps = {
  to: FileRouteTypes["to"];
  params: Record<string, string>;
  label: string;
  icon?: ReactNode;
};

const NavListItem = ({ to, params, icon, label }: NavListItemProps) => {
  return (
    <List.Item display="flex" alignItems="center" gap="0.5rem">
      <Flex
        asChild
        width="full"
        display="grid"
        gap="0.3rem"
        py="0.5rem"
        gridTemplateColumns="min-content 1fr min-content"
        alignItems="center"
      >
        <Link to={to} params={params}>
          {icon}
          <Text textStyle="md" as="span">
            {label}
          </Text>
          <ChevronRightIcon />
        </Link>
      </Flex>
    </List.Item>
  );
};

export type NavListProps = {
  children: ReactNode;
};

export const NavList = ({ children }: NavListProps) => {
  return <List.Root>{children}</List.Root>;
};

NavList.Item = NavListItem;
