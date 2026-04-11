import type { ReactNode } from "react";
import { List } from "~/shared/ui";

export type ActivityListItemProps = {
  children: ReactNode;
};

export const ActivityListItem = ({ children }: ActivityListItemProps) => {
  return (
    <List.Item display="flex" minH={0} alignSelf="stretch">
      {children}
    </List.Item>
  );
};
