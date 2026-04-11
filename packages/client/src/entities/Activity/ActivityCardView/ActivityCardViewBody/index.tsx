import type { ReactNode } from "react";
import { Card } from "~/shared/ui";

export type ActivityCardViewBodyProps = {
  children: ReactNode;
};

export const ActivityCardViewBody = ({
  children,
}: ActivityCardViewBodyProps) => {
  return (
    <Card.Body p={0} flex="1" display="flex" flexDirection="column" minH={0}>
      {children}
    </Card.Body>
  );
};
