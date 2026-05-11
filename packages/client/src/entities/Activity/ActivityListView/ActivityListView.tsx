import type { ReactNode } from "react";
import { List, type ListProps } from "~/shared/ui";
import { ActivityListItem } from "./ActivityListItem";

import styles from "./ActivityListView.module.css";

export interface ActivityListViewProps extends ListProps {
  children: ReactNode;
}

export const ActivityListView = ({
  children,
  ...props
}: ActivityListViewProps) => {
  return (
    <List.Root className={styles.container} {...props}>
      {children}
    </List.Root>
  );
};

ActivityListView.Item = ActivityListItem;
