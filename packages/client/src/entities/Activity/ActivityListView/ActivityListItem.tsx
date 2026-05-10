import type { ListItemProps } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";
import { List } from "~/shared/ui";

export interface ActivityListItemProps extends ListItemProps {
  children: ReactNode;
}

export const ActivityListItem = forwardRef<
  HTMLLIElement,
  ActivityListItemProps
>(({ children, ...props }, ref) => {
  return (
    <List.Item ref={ref} display="flex" minH={0} alignSelf="stretch" {...props}>
      {children}
    </List.Item>
  );
});
