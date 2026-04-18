import type { ListItemProps } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { List } from "~/shared/ui";

export interface ActivityListItemProps extends ListItemProps {
  children: ReactNode;
}

export const ActivityListItem = ({
  children,
  ...props
}: ActivityListItemProps) => {
  return (
    <List.Item display="flex" minH={0} alignSelf="stretch" {...props}>
      {children}
    </List.Item>
  );
};
