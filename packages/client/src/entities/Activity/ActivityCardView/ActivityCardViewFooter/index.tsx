import type { ReactNode } from "react";
import { Card } from "~/shared/ui";

export type ActivityCardViewFooterProps = {
  children: ReactNode;
};

export const ActivityCardViewFooter = ({
  children,
}: ActivityCardViewFooterProps) => {
  return (
    <Card.Footer
      p={0}
      justifyContent="space-between"
      alignItems="end"
      mt="auto"
    >
      {children}
    </Card.Footer>
  );
};
