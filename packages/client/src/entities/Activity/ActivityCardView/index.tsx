import { type ReactNode } from "react";
import { Card } from "~/shared/ui";

import { ActivityCardViewFooter } from "./ActivityCardViewFooter";
import { ActivityCardViewBody } from "./ActivityCardViewBody";

export type ActivityCardProps = {
  children: ReactNode;
  onClick?: () => void;
};

export const ActivityCardView = ({ children, onClick }: ActivityCardProps) => {
  return (
    <Card.Root
      flex="1"
      w="100%"
      minH="clamp(7.5rem, 28vw, 10rem)"
      h="100%"
      display="flex"
      flexDirection="column"
      p="0.8rem"
      borderRadius="2xl"
      gap={1}
      cursor="pointer"
      onClick={onClick}
      overflow="hidden"
      _hover={{ bg: "bg.subtle" }}
    >
      {children}
    </Card.Root>
  );
};

ActivityCardView.Body = ActivityCardViewBody;
ActivityCardView.Footer = ActivityCardViewFooter;
