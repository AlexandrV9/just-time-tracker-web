import clsx from "clsx";
import { Box, type BoxProps } from "~/shared/ui";

import styles from "./TopContainer.module.css";

export type TopContainerProps = BoxProps;

export const TopContainer = ({
  children,
  className,
  ...props
}: TopContainerProps) => {
  return (
    <Box
      flexShrink={0}
      zIndex={10}
      bg="bg"
      className={clsx(styles.container, className)}
      {...props}
    >
      <Box className={styles.content}>{children}</Box>
    </Box>
  );
};
