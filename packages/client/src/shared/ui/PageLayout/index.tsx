import clsx from "clsx";

import styles from "./PageLayout.module.css";
import { Box, type BoxProps } from "~/shared/ui";
import { BottomContainer, MainContainer, TopContainer } from "./components";

export interface PageLayoutProps extends BoxProps {
  className?: string;
}

export const PageLayout = ({ className, ...props }: PageLayoutProps) => {
  return (
    <Box
      className={clsx(styles.container, className)}
      flex="1"
      minH={0}
      h="full"
      w="full"
      {...props}
    />
  );
};

PageLayout.BottomContainer = BottomContainer;
PageLayout.TopContainer = TopContainer;
PageLayout.MainContainer = MainContainer;
