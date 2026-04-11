import type { ReactNode } from "react";
import { List } from "~/shared/ui";
import { ActivityListItem } from "./ActivityListItem";

export type ActivityListViewProps = {
  children: ReactNode;
};

export const ActivityListView = ({ children }: ActivityListViewProps) => {
  return (
    <List.Root
      listStyleType="none"
      w="full"
      gap="0.75rem"
      display="grid"
      gridTemplateColumns="repeat(2, minmax(0, 1fr))"
      md={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
      xl={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
      alignItems="stretch"
    >
      {children}
    </List.Root>
  );
};

ActivityListView.Item = ActivityListItem;
